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

function getFriendlyTime(time){
	var h = pad(time.getHours()),
		m = pad(time.getMinutes()),
		s = pad(time.getSeconds());

	return h + ':' + m + ':' + s;

	function pad(x){

		//	allow type conversion
		if(x < 10){
			return '0' + x;
		};

		return x;
	};
};

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


$(function(){
	var taskGraph = new TaskGraph($('#test'));
});

/**********************/

function TaskGraph(element){
	var taskGraphElement = element,
		newTaskButton,
		summaryButton,
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
	summaryButton = $('<button>')
		.text('summary')
		.click(showSummary);

	saveButton = $('<button>')
		.text('save')
		.click(save);

	//	wrapper for controls
	controls = $('<div>').append(newTaskButton, summaryButton, saveButton);
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

	function showSummary(){
		var summary = [];

		for(var i = 0; i < taskLines.length; i++){
			summary.push( taskLines[i].getSummary() );
		};

		console.log(summary);
		summary = JSON.stringify(summary);
		localStorage.summary = summary;
		console.log(summary);
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

	//	public
	return {
		addTaskGroup: addTaskGroup,
		save: save
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
		category;

	if(data){
		start = new Date(data.start);
		end = data.end ? new Data(data.end) : undefined;
	};

	taskElement = $('<div>')
		.addClass('task')
		.click(function(e){
			e.stopPropagation();
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

	function getTasks(){
		if(location === 'localStorage'){
			return getTasksLocal();
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

	function getTasksLocal(){
		var tasks = localStorage.tasks;

		//	convert from JSON or create a new array
		if(tasks !== undefined){
			tasks = JSON.parse(tasks);
		} else {
			tasks = [];
		};

		return tasks;
	};

	function setTasksLocal(t){
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

	return {
		saveCategories: saveCategories,
		saveTasks: saveTasks
	};
};