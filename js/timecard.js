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





function TaskManager(){

	var events = [];

	/**
	* @param {Task} e
	**/
	this.addEvent = function(e){
		events.push(e);
	};

	/**
	* @return {object}
	**/
	this.getEvents = function(){
		
		var e = {};

		for(var i = 0; i < events.length; i++){
			e[i] = events[i].toString();
		};

		return e;
	};
};





/*********************************/

var taskGraph,
	taskManager = new TaskManager();

$(function(){
	/*

	var taskLineAdder = new TaskLine().getElement().click(addTaskLine).html('click for new task');

	taskGraph = $('#taskGraph').append(taskLineAdder);


//	addTaskLine();

	$('#save').click(function(){
		var data = [],
			tasks = $('.task');

		for(var i = 0; i < tasks.length; i++){
			data.push($(tasks[i]).data('task').getData());
		};

		console.log(data);
		console.log(JSON.stringify(data));

		localStorage.data = JSON.stringify(data);
	});

	

	$('#summary').click(function(){
		var data = JSON.parse($.trim(localStorage.data));
		
		console.log(data);

		//	sort data
		data.sort(function(a, b){
			var a = String(a.label).substr(0, 1)
				b = String(b.label).substr(0, 1);

			if(a < b){
				return -1;
			} else if (a > b){
				return 1;
			} else {
				return 0;
			};
		});

		
		$('#summaryOut').empty();

		//	find times for each
		for(var i = 0; i < data.length; i++){
			var start = new Date(data[i].start),
				end = new Date(data[i].end),
				lineOut;

			data[i].duration = Math.round((end.getTime() - start.getTime()) / 1000);

			if(!isNaN(data[i].duration)){
				data[i].duration = convertSecondsToTime(data[i].duration);

				lineOut = data[i].duration + ' > ' + data[i].label;

				console.log(lineOut);
				$('#summaryOut').append($('<div>').html(lineOut));
			};
		};
	});



	function addTaskLine(){

		var taskLine = new TaskLine();

		//	add new TaskLine
		taskGraph.prepend(taskLine.getElement());

		taskGraph.prepend(taskLineAdder);
	};


















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
	

//	clearInterval(ticInterval);
*/


	/******************/
	(function(){
		var taskGraph = new TaskGraph($('#test'));

	})();


});


function TaskGraph(element){
	var taskGraphElement = element,
		newTaskButton,
		summaryButton,
		controls,
		taskLines = [];

	//	set css
	taskGraphElement.css({
		position: 'relative',
		width: '800px',
		height: '300px'
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

	function addTaskLine(){
		var taskLine = new TaskLine();

		taskLines.push(taskLine);
		taskGraphElement.prepend(taskLine.getElement());
	};

	function showSummary(){
		var summary = [];

		for(var i = 0; i < taskLines.length; i++){
			summary.push( taskLines[i].getSummary() );
		};

		summary = JSON.stringify(summary);
		localStorage.summary = summary;
		console.log(summary);
	};

	function TaskLine(){
		var taskLineElement,
			timeline,
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

		function Toggle(){

			var toggleElement,
				playing = true;

			toggleElement = $('<div>')
				.addClass('toggle')
				.text('pause')
				.click(toggle);

			function toggle(){

				var newestTask = tasks[tasks.length - 1];

				if(playing){
					toggleElement.text('play');
				} else {
					toggleElement.text('pause');
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

		return {
			getElement: getElement,
			getSummary: getSummary
		};
	};


	function Task(data){
		var start = new Date(),
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
				start = time;
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
				duration = Math.round((end.getTime() - start.getTime()) / 1000);

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

		return {
			getElement: getElement,
			getSummary: getSummary,
			getEnd: getEnd,
			setEnd: setEnd
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