var taskGroups = [];
var graphStart;
var router;

var AppRouter = Backbone.Router.extend({
	routes: {
		'record': 'startRecorder',
		'summary': 'loadSummary'
	}
});

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
		var taskView = new TaskView({
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

var TaskGroupView = Backbone.View.extend({
	initialize: function(){
		var that = this;
		var template = _.template( $('#task-group-view').html(), {} );
		this.$el.append(template).prependTo( $('.recorder') );
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
		this.$el.find('.taskGroupLabel').html(this.model.get('label'));
	},
	renderToggle: function(){
		var that = this;

		this.$el.find('.toggle > span').toggleClass('icon-play icon-pause');

		this.$el.slideUp(function(){
			that.$el.prependTo($('.recorder')).slideDown();
		});

		// if(this.model.get('running') && this.$el.find('.end').val() !== $('.recorder > div').first().find('.end').val()){
		// 	this.$el.slideUp(function(){
		// 		that.$el.prependTo($('.recorder')).slideDown();
		// 	});
		// };
	},
	events: {
		'click .toggle': 'toggle',
		'click .taskGroupLabel': 'modifyLabel'
	},
	toggle: function(){
		this.model.toggle();
	},
	modifyLabel: function(){
		var label = this.$el.find('.taskGroupLabel'),
			input = $('<input>'),
			that = this;

		label.after(input).hide();

		input
		.val(this.model.get('label'))
		.focus()
		.blur(function(){
			var input = $(this);
			that.model.set({label: input.val()});
			input.hide();
			label.show();
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

		this.model.on('change:scale', function(){
			that.rescale();
		});
	},
	render: function(){

		var start = this.model.get('start'),
			end = this.model.get('end');

		var that = this;

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
		'click': 'showTaskModifier',
		'hover': 'hover'
	},
	hover: function(ev){
		var task = this.$el.find('.task');

		if(ev.type === 'mouseenter'){
			task.css('box-shadow', '0px 0px 15px ' + task.css('border-color'));
		} else {
			task.css('box-shadow', '');
		};
		
	},
	showTaskModifier: function(){
		var mod = new TaskModifierView({
			taskModel: this.model,
			taskView: this
		});
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
	},
	rescale: function(){
		var 
			/**
			* difference between the start of this graph and now
			* @property timeSpan
			* @type number
			**/
			timeSpan,

			/**
			* current width of the .tasks element that contains this .task
			* @property timelinePixels
			* @type number
			**/
			timelinePixels,
			left,
			width,

			MIN_WIDTH = 20,
			start,
			end;

		timeSpan = Date.now() - graphStart;
		timelinePixels = this.$el.closest('.tasks').width();
		start = this.model.get('start');
		end = this.model.get('end');

		left = Math.max( 0, (start - graphStart) / timeSpan * timelinePixels );
		width = end ? (end - start) / timeSpan * timelinePixels : timelinePixels - left;
		width = Math.max(width, MIN_WIDTH);

		this.$el.find('.task').css({
			left:left,
			width:width
		});
	}
});

var TaskModifierView = Backbone.View.extend({
	initialize: function(){

		var template = _.template( $('#task_modifier_view_template').html(), {} );
		this.$el.html(template);
		this.$el.appendTo( this.options.taskView.$el.find('.task') );
		this.render();
	},

	render: function(){
		var start = this.options.taskModel.get('start'),
			end = this.options.taskModel.get('end');

		start = getTimeStampFromDate(new Date(start));
		if(end){
			end = getTimeStampFromDate(new Date(end));
		};

		this.$el.find('input').first().focus();
		$('.start', this.$el).val(start);
		$('.end', this.$el).val(end);
	},

	events: {
		'click': 'preventBubble',
		'submit form': 'submitForm',
		'click .delete': 'deleteTask'
	},

	preventBubble: function(ev){
		ev.stopPropagation();
	},

	submitForm: function(){

		var start = $('.start', this.$el),
			end = $('.end', this.$el);

		start = getDateFromTimeStamp(start.val());
		end = getDateFromTimeStamp(end.val());

		start = start.getTime();
		if(end){
			end = end.getTime();
		};

		this.options.taskModel.set({
			start: start,
			end: end
		});

		this.remove();
		return false;
	},

	deleteTask: function(){

		var that = this,
			taskModel = this.options.taskModel,
			taskView = this.options.taskView;

		taskModel.destroy({
			success: function(){
				that.remove();
				taskView.remove();
			}
		});
	}
});

var SummaryView = Backbone.View.extend({
	initialize: function(){
		var now = new Date();

		var vars = {
			start: getFriendlyDate(now),
			end: getFriendlyDateTimeStamp(now)
		};
		
		var template = _.template( $('#summary_view').html(), vars );
		
		this.$el.empty().html(template);
		this.render();
	},
	render: function(){

	},
	events: {
		'submit form': 'submit'
	},
	submit: function(){
		var start = $('.start', this.$el).val(),
			end = $('.end', this.$el).val();

		//	convert values to times
		start = convertUserInputToDate(start).getTime();
		end = convertUserInputToDate(end).getTime();

		console.log(start, end);

		return false;
	}
});

$(function(){

	//=================================================================
	//	setup routes
	router = new AppRouter;
	
	router.on('route:startRecorder', function(){
		$('#startRecorder').attr('disabled', 'disabled');
		$('#loadSummary').removeAttr('disabled');
		record();
	});

	router.on('route:loadSummary', function(){
		$('#loadSummary').attr('disabled', 'disabled');
		$('#startRecorder').removeAttr('disabled', 'disabled');
		summary();
	});

	//	needed so Routers start working
	Backbone.history.start();


	//=================================================================
	//	events
	
});


/**
* load the view for the recorder so we can start recording tasks
**/
function record(){
	var template = _.template( $('#recorder').html(), {} );
	$('.page').empty().html(template);


	$('.new-taskGroup').click(function(){

		graphStart = graphStart || Date.now();

		var taskGroup = new TaskGroupModel();
		var taskGroupView = new TaskGroupView({
			model: taskGroup
		});

		taskGroup.addTask();

		taskGroups.push(taskGroup);
	});

	//	start scaling graph
	setInterval(refreshGraph, 1000);
};	


/**
* load the summary page
**/
function summary(){
	var summaryView = new SummaryView({
		el: $('.page')
	});

};


/**
* Converts seconds into h:mm:ss format.
* @param {Date} date
* @return {string}
**/
function getTimeStampFromDate(date){
	var h,
		m,
		s;

	if(date === undefined){
		return;
	};

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


/**
* get the mm/dd/yyyy format of a Date
* @param {Date} date
* @return {string} mm/dd/yyyy
**/
function getFriendlyDate(date){
	var m = date.getMonth() + 1,
		d = date.getDate(),
		y = date.getFullYear();

	return m + '/' + d + '/' + y;	
};


/**
* Converts a valid Date object into m/d/y h:mi:s format.
* @param {Date} time
* @return {string}
**/
function getFriendlyDateTimeStamp(time){
	var date = getFriendlyDate(time),
		timeStamp = getTimeStampFromDate(time);

	return date + ' ' + timeStamp;
};


/**
* [m/d[/y] ]h24[:mi[:s]]
* @return {Date}
**/
function convertUserInputToDate(x){
	//	new Date(year, month, day [, hour, minute, second, millisecond])
	
	var parts = [],
		dayPart,
		timePart;

	if(x == undefined || x === ''){
		return undefined;
	};

	//	What did they provide?
	if(x.indexOf(' ') !== -1){
		parts = x.split(' ');
		dayPart = parts[0];
		timePart = parts[1];

	} else if(x.indexOf('/') !== -1) {
		dayPart = x;
	} else {
		timePart = x;
	};

	//	complete the parts
	dayPart = getDayPart(dayPart);
	timePart = getTimePart(timePart);

	return new Date(dayPart.y, dayPart.m, dayPart.d, timePart.h, timePart.mi, timePart.s);

	/**
	* @return {object.m}
	* @return {object.d}
	* @return {object.y}
	**/
	function getDayPart(dayPart){
		var m, d, y, 
			parts = [],
			now = new Date();

		//	set defaults
		m = now.getMonth() + 1;
		y = now.getFullYear();
		d = now.getDate();

		if(dayPart){
			
			parts = dayPart.split('/');
			m = parts[0];
			d = parts[1];

			//	they provided a year, too
			if(parts.length === 3){
				y = parts[2];
			};
		};
		
		return {
			m: m - 1,
			d: d,
			y: y
		};
	};

	/**
	* @return {object.h}
	* @return {object.mi}
	* @return {object.s}
	**/
	function getTimePart(timePart){
		var h, mi, s, 
			parts = [],
			now = new Date();

		//	set defaults
		h = 0;
		mi = 0;
		s = 0;

		if(timePart){
			
			parts = timePart.split(':');
			h = parts[0];
			mi = parts[1] || 0;

			//	they provided seconds, too
			if(parts.length === 3){
				s = parts[2];
			};
		};

		return {
			h: h,
			mi: mi,
			s: s
		};
	};
};

/**
* tell each TaskGroup to rescale its Tasks
**/
function refreshGraph(){
	for(var i = 0; i < taskGroups.length; i++){
		taskGroups[i].scaleTasks();
	};
};

// $.ajaxPrefilter(function(options){
// 	options.url = 'http://wordtotheblurd.com/dev/timecard/new/' + options.url;
// });