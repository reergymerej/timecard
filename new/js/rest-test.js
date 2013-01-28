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
	initialize: function(){
		this.attributes.start = Date.now();
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

		var start = this.model.get('start'),
			end = this.model.get('end');

		start = new Date(this.model.get('start'));
		start = getTimeStampFromDate(start);

		if(end){
			end = new Date(this.model.get('end'));
			end = getTimeStampFromDate(end);
		};

		this.$el.find('.start').val(start);
		this.$el.find('.end').val(end);

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
		start = getDateFromTimeStamp(start).getTime();

		end = this.$el.find('.end').val();
		if(end){
			end = getDateFromTimeStamp(end).getTime();
		};

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

/**
* Converts seconds into h:mm:ss format.
* @param {integer} date
* @return {string}
**/
function getTimeStampFromDate(date){
	var h,
		m,
		s;

	h = date.getHours();
	m = pad(date.getMinutes());
	s = pad(date.getSeconds());

	return h + ':' + m + ':' + s;

	function pad(x){
		if(Number(x) < 10){
			return '0' + x;
		};
		return x;
	};
};


/**
* get Date for today adjusted by h:mm:ss
* @param {string} time h:mm:ss
* @return {Date}
**/
function getDateFromTimeStamp(time){
	var parts = time.split(':'),
		date = new Date();

	if(parts.length < 3){
		return;
	};

	date.setHours(parts[0]);
	date.setMinutes(parts[1]);
	date.setSeconds(parts[2]);

	return date;
};


// $.ajaxPrefilter(function(options){
// 	options.url = 'http://wordtotheblurd.com/dev/timecard/new/' + options.url;
// });