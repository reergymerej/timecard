var taskGroups = [];

var TaskGroupModel = Backbone.Model.extend({
	defaults: {
		label: 'label',
		running: false,
		tasks: []
	},
	initialize: function(){
		var that = this;
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
		var taskView = new TaskView({
			model: task,
			container: this.attributes.taskContainer
		});

		task.save();

		this.attributes.tasks.push(task);
	}
});

var TaskGroupView = Backbone.View.extend({
	initialize: function(){
		var that = this;
		var template = _.template( $('#task-group-view').html(), {} );
		this.$el.append(template).appendTo( $('.recorder') );
		this.render();

		this.model.set({taskContainer: this.$el.find('.tasks')});

		//	listen to model for changes
		this.model.on('change:label', function(){
			that.render();
		});
		this.model.on('change:running', function(){
			that.renderToggle();
		});
	},
	render: function(){
		this.$el.find('label').html(this.model.get('label'));
	},
	renderToggle: function(){
		this.$el.find('.toggle > span').toggleClass('icon-play icon-pause');
	},
	events: {
		'click .toggle': 'toggle'
	},
	toggle: function(){
		this.model.toggle();
	}
});

var TaskModel = Backbone.Model.extend({
	urlRoot: 'php/api/Task',
	defaults: {
		start: Date.now()
	},
	initialize: function(){
	},
	stop: function(){
		this.set({end: Date.now()});
		this.save();
	}
});

var TaskView = Backbone.View.extend({
	initialize: function(){
		
		var that = this;
		var template = _.template( $('#task_view_template').html(), {} );
		this.$el.html( template );
		this.options.container.prepend( this.el );
		this.render();

		//	rerender when model changes
		this.model.on('change:start change:end change:label', function(){
			that.render();
		});
	},
	render: function(){
		this.$el.find('.start').val(this.model.get('start'));
		this.$el.find('.end').val(this.model.get('end'));
	},
	events: {
		'click a': 'deleteTask',
		'change .start, .end': 'saveTask'
	},
	deleteTask: function(){
		var that = this;
		this.model.destroy({
			success: function(){
				that.remove();
			}
		});
	},
	saveTask: function(){
		var start,
			end;

		start = this.$el.find('.start').val();
		end = this.$el.find('.end').val();

		this.model.set({
			start: start,
			end: end
		});

		this.model.save();
	}
});


$(function(){
	$('.new-taskGroup').click(function(){
		var taskGroup = new TaskGroupModel();
		var taskGroupView = new TaskGroupView({
			model: taskGroup
		});

		taskGroup.addTask();

		taskGroups.push(taskGroup);
	});
});