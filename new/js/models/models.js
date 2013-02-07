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
	

	var TaskCollection = Backbone.Collection.extend({
		model: TaskModel,
		url: 'php/api/Task/'
	});


	return {
		TaskGroupModel: TaskGroupModel,
		TaskModel: TaskModel,
		TaskCollection: TaskCollection
	};
});