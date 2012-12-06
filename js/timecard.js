/*
have horizontal timeline
click to add a new event
	initialize start at the current time
	add label after
when clicking on event, show options (change start, end, label, resume)
click on current event to stop at current time
drag edges of event to adjust start/end times, snap to 15 minutes
horizontal timeline keeps updating every 60 seconds
save to cookies
save to DB
export as JSON
*/

/**
* @param {object} data
**/


/*********************************/

/**
* Converts a valid Date object into m/d/y h:mi:s format.
* @param {Date} time
* @return {string}
**/
function getFriendlyDateTimeStamp(time){
	var m = time.getMonth() + 1,
		d = time.getDate(),
		y = time.getFullYear(),
		timeStamp = getFriendlyTimeStamp(time);

	return m + '/' + d + '/' + y + ' ' + timeStamp;
};

/**
* @param {Date, number} time accepts Date or miliseconds
* @return string in format hh:mi:ss
**/
function getFriendlyTimeStamp(time){
	var time,
		h,
		mi,
		s;

	//	convert time to Date if needed
	if(typeof time === 'number'){
		time = new Date(time);
	};

	h = pad(time.getHours());
	mi = pad(time.getMinutes());
	s = pad(time.getSeconds());

	return h + ':' + mi + ':' + s;

	//	pad with leading zero if needed
	function pad(x){

		//	allow type conversion
		if(x < 10){
			return '0' + x;
		};

		return x;
	};
};


/**
* Converts seconds into h:m:s format.
* @param {integer} sec
* @return {string}
**/
function convertSecondsToTime(sec){
	var h,
		m,
		s;

	h = Math.floor( sec / (60 * 60) );
	sec = sec % ( 60 * 60 );

	m = Math.floor( sec / 60 );
	s = sec % 60;

	return pad(h) + ':' + pad(m) + ':' + pad(s);

	function pad(x){
		if(Number(x) < 10){
			return '0' + x;
		};

		return x;
	};
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

$(function(){
	var taskGraph = new TaskGraph($('#graph'));
});

/**********************/

function TaskGraph(element){
	var taskGraphElement = element,
		newTaskButton,
		saveButton,
		controls,
		taskLines = [],
		startTime = Date.now(),
		refreshInterval = 250,
		DEFAULT_MAX_REFRESH = 5000,
		taskManager = new TaskManager();

	//	set css
	taskGraphElement.css({
		position: 'relative'
	});

	taskGraphElement.addClass('taskGraph');

	//	new task button
	newTaskButton = $('<button>')
		.text('new task')
		.click(addTaskGroup);

	//	summary button
	$('#summary_form')
		.submit(function(){
			var start = $('#start').val(),
				end = $('#end').val() || '24';

			//	convert these values into dates
			start = convertUserInputToDate(start);
			end = convertUserInputToDate(end);

			showSummary(start, end);
			
			return false;
		});

	saveButton = $('<button>')
		.text('save')
		.click(save);

	//	wrapper for controls
	controls = $('<div>').append(newTaskButton, saveButton);
	taskGraphElement.before(controls);

	//	start clock
	setTimeout(adjustGraph, refreshInterval);

	//	rescale graph
	function adjustGraph(){
		var currentTime = Date.now(),
			timeSpan = currentTime - startTime;

		for(var i = 0; i < taskLines.length; i++){
			taskLines[i].scale(startTime, timeSpan);
		};

		//	set up next refresh
		maxRefreshInterval = getRefresh();
		console.log(maxRefreshInterval);
		refreshInterval = Math.min(refreshInterval * 1.3, maxRefreshInterval);
		setTimeout(adjustGraph, refreshInterval);

		function getRefresh(){
			var x = $('#refresh').val() || DEFAULT_MAX_REFRESH;

			if(x === DEFAULT_MAX_REFRESH){
				return x;
			} else {
				return x * 100;
			};
		};
	};

	function addTaskGroup(){
		var taskGroup = new TaskGroup();

		taskLines.push(taskGroup);
		taskManager.addTaskGroup(taskGroup);
		taskGraphElement.prepend(taskGroup.getElement());
	};

	function showSummary(start, end){
		var summary = taskManager.getSummary(start, end),
			summaryContainer = $('#summary');

		//	empty existing summary
		summaryContainer.empty();

		for(var i = 0; i < summary.length; i++){			
			summaryContainer.append($('<div>').text(summary[i]));
		};
	};

	function save(){
		taskManager.save();
	};
};


function TaskManager(){
	var taskGroups = []
		history = new HistoryProxy('localStorage');

	function addTaskGroup(tg){
		taskGroups.push(tg);
	};

	function save(){

		var categoriesUsed = [],
			category,
			tasksUsed = [];
		
		//	capture current organization of Tasks and TaskGroups
		for(var i = 0; i < taskGroups.length; i++){
			
			taskGroups[i].save();

			//	concatenate so arrays returned from TaskGroup are combined into one
			tasksUsed = tasksUsed.concat(taskGroups[i].getTasks());

			//	collect categories used
			category = taskGroups[i].getCategory();
			if(categoriesUsed.indexOf(category) === -1){
				categoriesUsed.push(category);
			};
		};

		//	save to localStorage for now
		history.saveCategories(categoriesUsed);
		history.saveTasks(tasksUsed);
	};

	function getSummary(start, end){
		
		var tasks = history.getTasks(start, end);

		//	sort tasks by start
		tasks.sort(function(a, b){
			return a.start - b.start;
		});

		//	add additional info to each task
		for(var i = 0; i < tasks.length; i++){
			
			if(tasks[i].duration){
				tasks[i].end = getFriendlyDateTimeStamp(new Date(tasks[i].start + tasks[i].duration * 1000));
				tasks[i].duration = convertSecondsToTime(tasks[i].duration);
			} else {
				tasks[i].end = 'now';
				tasks[i].duration = convertSecondsToTime( Math.round( (Date.now() - tasks[i].start) / 1000) );
			};

			tasks[i].start = getFriendlyDateTimeStamp(new Date(tasks[i].start));

			tasks[i] = tasks[i].start + ' - ' + tasks[i].end + ' (' + tasks[i].duration + ') : ' + tasks[i].category;
		};

		return tasks;
	};

	//	public
	return {
		addTaskGroup: addTaskGroup,
		save: save,
		getSummary: getSummary
	}
};


function TaskGroup(){
	var publicInterface = {},
		taskLineElement,
		timeline,
		timelineWidth,	// update this on window resize
		controls,
		toggle,
		label,
		category,
		tasks = [];

	/*********************************
			public interface
	*********************************/

	publicInterface = {
		getElement: getElement,
		getCategory: getCategory,
		getTasks: getTasks,
		scale: scale,
		save: save,
		deleteTask: deleteTask,
		addTask: addTask
	};

	taskLineElement = $('<div>').addClass('taskLine');

	timeline = $('<div>').addClass('timeline');
	controls = $('<div>').addClass('controls');

	//	initialize
	addTask();
	toggle = new Toggle();
	label = new Label();

	controls.append(
		toggle.getElement(),
		label.getElement()
	);

	//	add components
	taskLineElement.append(timeline, controls);

	function addTask(){
		var task = new Task(publicInterface),
			taskElement = task.getElement();

		tasks.push(task);

		timeline.append(taskElement);

		taskElement.click(function(e){
			e.stopPropagation();

			console.log('pause graph adjustment until this is over');
			
			//	create a new view to modify task
			new TaskModifierView({ task: task });
		});
	};

	function deleteTask(t){
		console.log('deleteing task', t);

		for(var i = 0; i < tasks.length; i++){
			if(tasks[i] === t){
				tasks[i].getElement().remove();
				tasks.splice(i, 1);
				return;
			};
		};
	};

	function getElement(){
		return taskLineElement;
	};

	function save(){

		//	record category
		category = label.getLabel();

		//	assign category to each task
		for(var i = 0; i < tasks.length; i++){
			tasks[i].setCategory(category);
		};
	};

	function scale(start, timeSpan){
		timelineWidth = timeline.width();

		for(var i = 0; i < tasks.length; i++){
			tasks[i].scale(start, timeSpan, timelineWidth);
		};
	};

	function getCategory(){
		return category;
	};

	function getTasks(){
		var taskSummaries = [];

		for(var i = 0; i < tasks.length; i++){
			taskSummaries.push(tasks[i].getSummary());
		};

		return taskSummaries;
	};

	/*********************************
			constructors
	*********************************/

	function TaskModifier(task){
		var view = new TaskModifierView({
			task: task
		});
	};

	function Label(){

		var labelElement,
			label = 'label';

		labelElement = $('<div>')
			.addClass('label')
			.click(function(){

				var input,
					oldLabel;

				oldLabel = $(this).text();

				$(this).empty();

				input = $('<input>')
					.val(oldLabel)
					.click(function(e){
						e.stopPropagation();
					})

					.blur(function(){

						var newVal = $.trim($(this).val());

						$(this).remove();

						if(newVal !== ''){
							setLabel(newVal);
						} else {
							setLabel(oldLabel);
						};
					});

				input
					.appendTo(labelElement)
					.focus();
			});

		//	set initial label
		setLabel(label);

		function setLabel(newLabel){
			label = newLabel;
			labelElement.text(label);
		};

		function getLabel(){
			return label;
		};

		function getElement(){
			return labelElement;
		};

		return {
			setLabel: setLabel,
			getLabel: getLabel,
			getElement: getElement
		};
	};

	function Toggle(){

		var toggleElement,
			playing = true;

		toggleElement = $('<div>')
			.addClass('toggle pause')
			.text('pause')
			.click(toggle);

		function toggle(){

			var newestTask = tasks[tasks.length - 1];

			if(playing){
				toggleElement
					.text('resume')
					.toggleClass('play pause');
			} else {
				toggleElement
					.text('pause')
					.toggleClass('play pause');
			};

			if(newestTask && newestTask.getEnd() === undefined){
				newestTask.setEnd();
			} else {
				//	create a new task (to the user, this looks like resuming)
				addTask();
			};

			playing = !playing;
		};

		function getElement(){
			return toggleElement;
		};	

		return {
			getElement: getElement
		};
	};

	/*********************************
			public interface
	*********************************/

	return publicInterface;
};


function Task(taskGroup){
	var taskGroup = taskGroup,
		start = new Date().getTime(),
		end,
		duration,
		taskElement,
		category,
		instance = this;

	taskElement = $('<div>')
		.addClass('task');

	/**
	* @param {number, Date} time
	* @return {boolean} success
	**/
	function setStart(time){

		var time = time;

		if(typeof time === 'object'){
			time = time.getTime();
		};

		if(time ===  undefined){
			start = Date.now();

		} else  {
			start = time;
		};
	};

	/**
	* @param {number, Date} time
	* @return {boolean} success
	**/
	function setEnd(time){

		var time = time || new Date();

		//	convert time if needed
		if(typeof time === 'object'){
			time = time.getTime();
		};
		
		if(time > start){
			end = time;
			
			//	record duration
			duration = Math.round((end - start) / 1000);

			return true;
		};

		return false;
	};

	function getEnd(){
		return end;
	};

	function getSummary(){

		return {
			start: start,
			duration: duration,
			category: category
		};
	};

	function getElement(){
		return taskElement;
	};

	function scale(graphStart, timeSpan, timelinePixels){
		
		var left = (start - graphStart) / timeSpan * timelinePixels,
			width = end ? (end - start) / timeSpan * timelinePixels : timelinePixels - left;
		
		taskElement.css({
			left: left + 'px',
			width: width + 'px'
		});


			//	identify left border & width

		//	position
	};

	function setCategory(c){
		category = c;
	};

	function destroy(){
		console.log('destroying task', this);
		taskGroup.deleteTask(this);
	};

	/*********************************
			public interface
	*********************************/
	return {
		getElement: getElement,
		getSummary: getSummary,
		setStart: setStart,
		getEnd: getEnd,
		setEnd: setEnd,
		scale: scale,
		setCategory: setCategory,
		destroy: destroy
	};
};

/**
* Used to abstract saving from where data is actually saved.  Provides a single interface for saving to localStorage or db.
* @param {string} location 'localStorage' is the only supported value so far
**/
function HistoryProxy(location){

	var location = location;

	/**
	* returns an array of categories from history
	**/
	function getCategories(){
		if(location === 'localStorage'){
			return getCategoriesLocal();
		};
	};

	function setCategories(c){
		if(location === 'localStorage'){
			setCategoriesLocal(c);
		};
	}

	/**
	* @param {Date} [start]
	* @param {Date} [end]
	**/
	function getTasks(start, end){
		if(location === 'localStorage'){
			return getTasksLocal(start, end);
		};
	};

	function setTasks(t){
		if(location === 'localStorage'){
			setTasksLocal(t);
		};
	};

	function getCategoriesLocal(){
		
		var categories = localStorage.categories;

		//	convert from JSON or create a new array
		if(categories !== undefined){
			categories = JSON.parse(categories);
		} else {
			categories = [];
		};

		return categories;
	};

	function setCategoriesLocal(c){
		localStorage.categories = JSON.stringify(c);
	};

	/**
	* @param {Date} [start]
	* @param {Date} [end]
	* @return {array}
	**/
	function getTasksLocal(start, end){
		
		var tasks = localStorage.tasks;

		//	convert from JSON or create a new array
		if(tasks !== undefined){
			tasks = JSON.parse(tasks);
		} else {
			tasks = [];
		};

		//	remove any tasks that start before specified start
		if(start){
			
			//	convert to ms for faster comparison
			start = start.getTime();

			//	tasks are stored in order, so we just need to find the first one that qualifies
			for(var i = 0; i < tasks.length; i++){
				if(tasks[i].start >= start){
					tasks = tasks.splice(i);
					break;
				};
			};
		};

		//	remove any that start after end
		if(end){

			//	convert for faster comparison
			end = end.getTime();

			//	splice off those out of bounds
			for(var i = 0; i < tasks.length; i++){
				if(tasks[i].start >= end){
					tasks.splice(i);
				};
			};
		};
		
		return tasks;
	};

	function setTasksLocal(t){

		//	sort by start
		t.sort(function(a, b){
			return a.start - b.start;
		});

		//	dedupe tasks
		for(var i = 0; i < t.length - 1; i++){
			if(t[i].start === t[i + 1].start){
				t.splice(i, 1);
			};
		};

		localStorage.tasks = JSON.stringify(t);
	};

	//	merge these categories with previously saved so we have a unique list
	function saveCategories(newCategories){
		var oldCategories = getCategories(),
			categories = [];

		//	combine oldCategories and categoriesUsed
		oldCategories = oldCategories.concat(newCategories);

		//	filter to only unique
		for(var i = 0; i < oldCategories.length; i++){
			if(categories.indexOf(oldCategories[i]) === -1){
				categories.push(oldCategories[i]);
			};
		};

		// save combined list
		setCategories(categories);
	};

	function saveTasks(newTasks){

		var oldTasks = getTasks(),
			tasks = [];

		//	TODO dedupe
		tasks = tasks.concat(oldTasks, newTasks);

		setTasks(tasks);
	};

	/**
	* @param {Date} [start]
	* @param {Date} [end]
	**/
	function getTasksFromHistory(start, end){
		return getTasks(start, end);
	};

	return {
		saveCategories: saveCategories,
		saveTasks: saveTasks,
		getTasks: getTasksFromHistory
	};
};


//=================================================================
TaskModifierView = Backbone.View.extend({

	initialize: function(){
		this.render();
	},

	render: function(){

		//	compile template
		var template = _.template( $('#taskModifier_template').html() );

		//	load compiled template
		this.$el.html( template );

		//	attach to DOM
		this.options.task.getElement().append(this.$el);

		//	prepopulate with current values from Task
		prepopulate(this.options.task);

		//	focus on first field
		this.$el.find('input').first().focus();
		
		function prepopulate(task){
			var taskSummary = task.getSummary(),
				start = taskSummary.start,
				end;

			if(taskSummary.duration){
				end = start + taskSummary.duration * 1000;
				end = getFriendlyTimeStamp(end);
			};

			start = getFriendlyTimeStamp(start);

			$('#start', this.$el).val(start);
			$('#end', this.$el).val(end);

			//	disable end for now if not already stopped to prevent TaskGroup toggle issue
			if(end === undefined){
				$('#end', this.$el).attr('disabled', 'disabled');
			};
		};
	},

	events: {
		'click form#timeAdjuster': 'clickForm',
		'submit form#timeAdjuster': 'submitForm',
		'click a.delete': 'deleteTask'
	},

	//	prevent bubbling so additional forms are not added
	clickForm: function(e){
		e.stopPropagation();
	},

	//	submit new times to change Task
	submitForm: function(){
		
		var start = $('#start', this.$el).val(),
			end = $('#end', this.$el).val(),
			task = this.options.task;

		if(validateForm()){
			if(start) {
				task.setStart(start);
			};

			if(end){
				task.setEnd(end);
			};

			//	remove view from DOM
			this.remove();
		};
		
		return false;

		function validateForm(){

			//	TODO don't change the values during validation
			if(start) {
				start = convertUserInputToDate(start);
			};

			if(end){
				end = convertUserInputToDate(end);
			};

			if(end){
				return start < end;
			} else {
				//	TODO handle overlapping Tasks
				return true;
			};
		};
	},

	//	delete this task
	deleteTask: function(){
		console.log('delete task', this.options.task);
		this.options.task.destroy();
	}
});