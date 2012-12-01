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

$(function(){
	/*

	var ticSeconds = 1000;
	var ticIntervalSeconds = ticSeconds;
	var startTime = new Date().getTime() / 1000;


	//	load first tics
	for(var i = 0; i < 10; i++){
		addTic();
	};

	function addTic(){
		var tic = getTic(),
			timeline = $('#timeline'),
			ticCount,
			ticWidth,
			timelineWidth = timeline.innerWidth(),
			MAX_TICS = 20,
			MIN_TICS = 10;

		timeline.append(tic);

		ticCount = Math.min($('.tic').length, MAX_TICS);

		if(ticCount === MAX_TICS){
			expandTicInterval();
		};

		ticWidth = timelineWidth/ticCount - 1; // border-width
		$('.tic').css('width', ticWidth + 'px');

		function getTic(){
			var label = convertSecondsToTime(Number($('.tic').length) * ticIntervalSeconds/1000);
			return $('<span>').html(label).addClass('tic');
		};

		function expandTicInterval(){
			timeline.empty();

			ticCount = MIN_TICS;
			ticIntervalSeconds *= 2;

			for(var i = 0; i < MIN_TICS; i++){
				timeline.append(getTic());
			};

			
		};
	};


	nextTic();

	function nextTic(){
		setTimeout(function(){
			addTic();
			setTimeout(nextTic, ticIntervalSeconds);
		})
	};
	*/

	var taskGraph = new TaskGraph($('#test'));

});


function TaskGraph(element){
	var taskGraphElement = element,
		newTaskButton,
		summaryButton,
		controls,
		taskLines = [],
		startTime = Date.now();

	//	set css
	taskGraphElement.css({
		position: 'relative'
	});

	taskGraphElement.addClass('taskGraph');

	//	new task button
	newTaskButton = $('<button>')
		.text('new task')
		.click(addTaskLine);

	//	summary button
	summaryButton = $('<button>')
		.text('summary')
		.click(showSummary);

	//	wrapper for controls
	controls = $('<div>').append(newTaskButton, summaryButton);
	taskGraphElement.before(controls);

	//	start clock
	setInterval(adjustGraph, 1000);

	//	rescale graph
	function adjustGraph(){
		var currentTime = Date.now(),
			timeSpan = currentTime - startTime;

		for(var i = 0; i < taskLines.length; i++){
			taskLines[i].scale(startTime, timeSpan);
		};
	};

	function addTaskLine(){
		var taskLine = new TaskLine()

		taskLines.push(taskLine);
		taskGraphElement.prepend(taskLine.getElement());
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

	function TaskLine(){
		var taskLineElement,
			timeline,
			timelineWidth,	// update this on window resize
			controls,
			toggle,
			label,
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

		//	return object
		function getSummary(){
			var summary = {
				label: label.getLabel(),
				tasks: []
			};

			for(var i = 0; i < tasks.length; i++){
				summary.tasks.push( tasks[i].getSummary() );
			};

			return summary;
		};

		function scale(start, timeSpan){
			timelineWidth = timeline.width();

			for(var i = 0; i < tasks.length; i++){
				tasks[i].scale(start, timeSpan, timelineWidth);
			};
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
			getSummary: getSummary,
			scale: scale
		};
	};

	function Task(data){
		var start = new Date().getTime(),
			end,
			duration,
			taskElement;

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

		function getStart(){
			return start;
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

				if( !isNaN(duration) ){
					duration = convertSecondsToTime(duration);
				};

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
				end: end,
				duration: duration
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

		/*********************************
				public interface
		*********************************/
		return {
			getElement: getElement,
			getSummary: getSummary,
			getEnd: getEnd,
			setEnd: setEnd,
			scale: scale
		};
	};
};

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