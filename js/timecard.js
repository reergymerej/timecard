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
function Task(data){
	var start = new Date(),
		end,
		label = 'new task',
		color,
		element,
		instance = this;

	if(data){
		start = new Date(data.start);
		end = data.end ? new Data(data.end) : undefined;
		label = data.label;
		color = data.color;
	};


	element = $('<div>')
		.addClass('task')
		.html(label)
		.click(function(e){
			
			var input = $('<input>')
				.click(function(e){
					e.stopPropagation();
				})

				.blur(function(){

					var newVal = $.trim($(this).val());

					if(newVal !== ''){
						
						instance.setLabel(newVal);
					};
					
					$(this).remove();
				});


			e.stopPropagation();

			$(this).append(input);

			input.focus();
		})
		.data('task', instance);


	/**
	* @param {Date} time
	* @return {boolean} success
	**/
	this.setStart = function(time){
		
		if(end === undefined || time < end){
			start = time;
			return true;
		};

		return false;
	};

	this.getStart = function(){
		return start;
	};

	/**
	* @param {Date} time
	* @return {boolean} success
	**/
	this.setEnd = function(time){

		var time = time || new Date();
		
		if(time > start){
			end = time;
			return true;
		};

		return false;
	};

	this.getEnd = function(){
		return end;
	};

	this.setLabel = function(newLabel){
		label = newLabel;
		element.html(newLabel);
	};

	this.getLabel = function(){
		return label;
	};

	this.toString = function(){
		var friendlyStart = getFriendlyTime(start),
			friendlyEnd = (end === undefined) ? '...' : getFriendlyTime(end);

		return friendlyStart + ' - ' + friendlyEnd + ' (' + label + ')';

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
	};

	this.getData = function(){
		
		return {
			start: start,
			end: end,
			label: label
			//color: color
		};
	};

	this.getElement = function(){
		return element;
	};
};




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



	/******************/
	(function(){
		var taskGraph = new TaskGraph($('#test'));
	})();


});


function TaskGraph(element){
	var element = element,
		newTaskButton,
		taskLines = [];

	//	set css
	element.css({
		position: 'relative',
		width: '500px',
		height: '300px'
	});

	element.addClass('taskGraph');

	//	new task button
	newTaskButton = $('<button>')
		.html('new task')
		.click(function(){
			addTask();
		});

	element.before(newTaskButton);

	function addTask(){
		var taskLine = new TaskLine();

		taskLines.push(taskLine);
		element.prepend(taskLine.getElement());
	};
};

function TaskLine(){
	var element,
		timeline,
		controls,
		label = 'new task',
		tasks = [];

	element = $('<div>')
		.addClass('taskLine');

	timeline = $('<div>').addClass('timeline');
	controls = $('<div>').addClass('controls');

	controls.append(
		$('<div>')
			.addClass('controls')
			.html('toggle'),

		new Label(label)
	);

	//	add components
	element.append(timeline, controls);

	//	add an initial task
	addTask();

	function addTask(){
		var task = new Task();
		tasks.push(task);

		timeline.append(task.getElement());
	};

	function Label(label){

		var element = $('<div>')
			.addClass('label')
			.html(label)

		return element;
	};

	//element.append(task.getElement());

	this.getElement = function(){
		return element;
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