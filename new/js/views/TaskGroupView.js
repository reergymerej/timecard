define([
	'text!templates/taskGroupTemplate.html',
	'collections/TaskCollection'
], function(
	taskGroupTemplate,
	TaskCollection
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

			this.collection = new TaskCollection();

			// //	TODO potential redundancy with events
			this.collection.on('change', function(task, changed){
				console.log('change', arguments);
				task.save();
			});

			this.collection.on('add', function(task){
				task.save();
			});


			templateData = {
				label: this.label
			};
			template = _.template(taskGroupTemplate, templateData);
			this.$el.html(template);

			

			//	"toggle" automatically to get a new task started
			this.toggle({currentTarget: $('.toggle')});
		},

		render: function(){

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
				this.collection.add({label: that.label});

			} else {

				$.each(this.collection.where({end: undefined}), function(i, task){
					task.set({
						end: Date.now()
					});
				});
			};
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