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

var Task = Backbone.Model.extend({
	defaults: {
		start: new Date(),
		end: undefined,
		label: 'no label'
	}
});





var TaskView = Backbone.View.extend({
	tagName: 'div',
	className: 'task',
	events: {
		'click .icon': 'open'
	},
	render: function(){
		
	}
});







var t = new Task();

console.log(t.get('start'));
console.log(t.get('end'));
console.log(t.get('label'));






//


/**
* @param {object} data
**/
function TimeEvent(data){
	var start,
		end,
		label,
		color;

	if(data){
		start = new Date(data.start);
		end = data.end ? new Data(data.end) : undefined;
		label = data.label;
		color = data.color;
	};

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
			label: label,
			color: color
		};
	};
};


function EventManager(){
	var events = [];

	/**
	* @param {TimeEvent} e
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
