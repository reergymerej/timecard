function TimeEvent(){
	var start,
		end,
		label,
		color;

	//	assume the start time is now
	start = new Date();

	
	this.getDescription = function(){
		var friendlyTime = getFriendlyTime(start),
			friendlyEnd = (end === undefined) ? '...' : getFriendlyTime(end);

		return start + ' - ' + end + ' (' + label + ')';
	};

	function getFriendlyTime(time){
		return time.getHours() + ':' + time.getMinutes();
	};
};

TimeEvent.prototype.setLabel = function(desc){
	this.label = desc;
};

TimeEvent.prototype.toString = function(){
	return this.getDescription();
};

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