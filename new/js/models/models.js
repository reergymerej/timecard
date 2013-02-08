define(['views/views'], function(views){
	var TaskGroupModel = Backbone.Model.extend({
		defaults: {
			label: 'new task',
			running: false
		},
		initialize: function(){
			var that = this;

			this.set({tasks: []});

			this.on('change:label', function(){
				for(var i = 0; i < that.attributes.tasks.length; i++){
					that.attributes.tasks[i].set({label: that.get('label')});
				};
			});
		},
		toggle: function(){
			this.set({running: !this.attributes.running});
			if(this.attributes.running){
				//	start a new task
				this.addTask();
			} else {
				//	stop the most recent task
				var task = this.attributes.tasks[this.attributes.tasks.length -1];
				task.stop();
			};
		},
		addTask: function(options){
			this.set({running: true});

			var task = new TaskModel({label: this.get('label')});
			var taskView = new views.TaskView({
				model: task,
				container: this.attributes.taskContainer
			});

			task.save();

			this.attributes.tasks.push(task);
		},
		scaleTasks: function(){
			$(this.attributes.tasks).each(function(i, task){
				task.scale();
			});
		}
	});

	/**
	* Create a model to use as the brains behind a summary of tasks.
	**/
	var SummaryModel = Backbone.Model.extend({
		initialize: function(){
			console.log('I am a new SummaryModel.');

			var that = this,
				now = new Date();

			//	These are managed internally.
			this.tasks = new TaskCollection();

			//	These are public.
			this.set({

				/**
				* @type Date
				**/
				start: now,

				/**
				* @type Date
				**/
				end: now
			});

			//	listen for events
			// this.on('change:start change:end', function(){
			this.on('change', function(){
				console.log('something changed', arguments, that.changed);

				//	fetch the collection of tasks
				that.tasks.fetch({
					data: {
						start: that.get('start').getTime(),
						end: that.get('end').getTime()
					},
					success: function(collection, models){
						that.tasks.each(function(t){
							console.log(t);

							//	we need to create a view for each of these
							//	Where should the references be stored?
						});
					}
				})

			});
		},

		//	validate that changes to this model are OK
		validate: function(attrs, options){
			if( attrs.start > attrs.end ){
				return 'invalid timeframe';
			};
		}
	});


	
	var TaskModel = Backbone.Model.extend({
		urlRoot: 'php/api/Task',
		initialize: function(){
			this.attributes.start = Date.now();
			this.on('change', function(){
				this.save();
			});
		},
		stop: function(){
			this.set({end: Date.now()});
			this.save();
		},
		scale: function(){
			//	trigger event so TaskView will fix itself
			this.trigger('change:scale');
		}
	});
	

	//	Collection must be defined after model
	var TaskCollection = Backbone.Collection.extend({
		model: TaskModel,
		url: 'php/api/Task/'
	});

	return {
		TaskGroupModel: TaskGroupModel,
		TaskModel: TaskModel,
		TaskCollection: TaskCollection,
		SummaryModel: SummaryModel
	};
});