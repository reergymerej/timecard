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



function TaskLine(){
	var element,
		task;

	element = $('<div>')
		.addClass('taskLine')
		.click(function(){
			
			var taskHolder = $(this).find('.task');

			task.setEnd();
			taskHolder.addClass('finished');

			//console.log( 'TaskLine:', $(this).find('.task').data('task').toString() );
		});

	task = new Task();

	element.append(task.getElement());

	this.getElement = function(){
		return element;
	};
};

/*********************************/

var taskGraph,
	taskManager = new TaskManager();

$(function(){

	var taskLineAdder = new TaskLine().getElement().click(addTaskLine).html('click for new task');

	taskGraph = $('#taskGraph').append(taskLineAdder);


//	addTaskLine();

	$('button').click(function(){
		var data = [],
			tasks = $('.task');

		for(var i = 0; i < tasks.length; i++){
			data.push($(tasks[i]).data('task').getData());
		};

		console.log(data);
		console.log(JSON.stringify(data));

		localStorage.data = JSON.stringify(data);
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



});


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