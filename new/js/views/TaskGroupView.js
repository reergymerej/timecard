define([
	'text!templates/taskGroupTemplate.html',
	'collections/TaskCollection',
	'views/TaskView'
], function(
	taskGroupTemplate,
	TaskCollection,
	taskView
){

	var TaskGroupView = Backbone.View.extend({
		
		initialize: function(){

			var template,
				templateData = {};

			/**
			* is the last task still running?
			* @property running
			* @type boolean
			**/
			this.running = false;

			this.label = 'new task';

			this.taskViews = [];

			this.collection = new TaskCollection();

			this.collection.on('add', function(task){
				task.save();
				task.on('change', function(task, changed){
					console.log('task changed: ', task.get('id'), changed.changes);
					task.save();
				});
			});


			templateData = {
				label: this.label
			};
			template = _.template(taskGroupTemplate, templateData);
			this.$el.html(template);

			

			//	"toggle" automatically to get a new task started
			this.toggle({currentTarget: $('.toggle')});
		},

		render: function(data){
			var that = this;
			$.each(this.taskViews, function(i, view){
				view.render($.extend(data, {width: $('.tasks', that.$el).width()}));
			});
		},

		events: {
			'click .toggle': 'toggle',
			'click .taskGroupLabel': 'editLabel'
		},

		toggle: function(ev){

			var that = this;

			//	swap out the button icon
			$('i', ev.currentTarget).toggleClass('icon-play icon-pause');

			this.running = !this.running;

			//	create a new task or stop any that are running
			if(this.running){
				this.addTask();

			} else {

				$.each(this.collection.where({end: undefined}), function(i, task){
					task.set({
						end: Date.now()
					});
				});
			};
		},

		addTask: function(){
			
			var task = new this.collection.model({label: this.label}),
				taskEl = $('<div>'),
				view;

			//	create a new subview
			$('.tasks', this.$el).append(taskEl);
			view = new taskView({
				el: taskEl,
				model: task
			});

			this.collection.add(task);
			this.taskViews.push(view);
		},

		editLabel: function(ev){

			var label = $(ev.currentTarget),
				input = $('<input>'),
				that = this;

			label.after(input).hide();

			input
				.val(this.label)
				.focus()
				.blur(function(){
					var input = $(this),
						newValue = input.val();
					
					input.remove();
					label.html(input.val()).show();

					//	change each model
					if(newValue != that.label){
						that.label = newValue;

						//	TODO	can we handle this through a change event on the collection?
						$.each(that.collection.models, function(i, task){
							task.set({
								label: that.label
							});
						});
					};
				});
		}
	});

	return TaskGroupView;
});