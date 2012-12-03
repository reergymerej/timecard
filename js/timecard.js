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
function getFriendlyTime(time){
	var h = pad(time.getHours()),
		mi = pad(time.getMinutes()),
		s = pad(time.getSeconds()),
		m = time.getMonth() + 1,
		d = time.getDate(),
		y = time.getFullYear();

	return m + '/' + d + '/' + y + ' ' + h + ':' + mi + ':' + s;

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
	var taskGraph = new TaskGraph($('#test'));
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
		maxRefreshInterval = 1000,
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
		refreshInterval = Math.min(refreshInterval * 1.3, maxRefreshInterval);
		$('#refresh').text(refreshInterval);
		setTimeout(adjustGraph, refreshInterval);
	};

	function addTaskGroup(){
		var taskGroup = new TaskGroup()

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
				tasks[i].end = getFriendlyTime(new Date(tasks[i].start + tasks[i].duration * 1000));
				tasks[i].duration = convertSecondsToTime(tasks[i].duration);
			} else {
				tasks[i].end = 'now';
				tasks[i].duration = convertSecondsToTime( Math.round( (Date.now() - tasks[i].start) / 1000) );
			};

			tasks[i].start = getFriendlyTime(new Date(tasks[i].start));

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
	var taskLineElement,
		timeline,
		timelineWidth,	// update this on window resize
		controls,
		toggle,
		label,
		category,
		tasks = [];

	taskLineElement = $('<div>')
		.addClass('taskLine');

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
		var task = new Task();
		tasks.push(task);

		timeline.append(task.getElement());
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

			if(newestTask.getEnd() === undefined){
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

	return {
		getElement: getElement,
		getCategory: getCategory,
		getTasks: getTasks,
		scale: scale,
		save: save
	};
};


function Task(data){
	var start = new Date().getTime(),
		end,
		duration,
		taskElement,
		category,
		instance;

	if(data){
		start = new Date(data.start);
		end = data.end ? new Data(data.end) : undefined;
	};

	taskElement = $('<div>')
		.addClass('task')
		.click(function(e){
			e.stopPropagation();

			console.log('pause graph adjustment until this is over');
			//	showTimeAdjuster
			$(this).append(
				$('<form>')
					.addClass('timeAdjuster')
					.append( newInput('start'), newInput('end'), $('<input>', {type: 'submit'}) )
					.submit(function(e){
						var start = $('#start', this).val(),
							end = $('#end', this).val();

						if(start) {
							start = convertUserInputToDate(start);
							setStart(start);
						};

						if(end){
							end = convertUserInputToDate(end);
							setEnd(end);
						};

						$(this).remove();
						return false;
					})
					.click(function(e){
						//	form submission triggers a click
						e.stopPropagation();
					})
					.blur(function(){
						console.log('blur');
					})
			);

			//	focus on first input
			$(this).find('input').first().focus();

			function newInput(id, blur){
				var input = $('<input>', {id: id})
					.click(function(e){
						e.stopPropagation();
					});

				return input;
			};
		});

	/**
	* @param {Date} time
	* @return {boolean} success
	**/
	function setStart(time){
		
		if(end === undefined || time < end){
			start = time.getTime();
			return true;
		};

		return false;
	};

	/**
	* @param {Date} time
	* @return {boolean} success
	**/
	function setEnd(time){

		var time = time || new Date();
		
		if(time > start){
			end = time;
			
			//	record duration
			duration = Math.round((end.getTime() - start) / 1000);

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

	/*********************************
			public interface
	*********************************/
	return {
		getElement: getElement,
		getSummary: getSummary,
		getEnd: getEnd,
		setEnd: setEnd,
		scale: scale,
		setCategory: setCategory
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