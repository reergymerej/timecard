/**
* reusable utility methods
* @module util
**/

define(function(){
	
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

		if(!time){
			return '';
		};

		//	convert time to Date if needed
		if(typeof time === 'string'){
			time = parseFloat(time);
		};

		if(typeof time === 'number'){
			time = new Date(parseFloat(time));
		};

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

	return {
		getTimeStampFromDate: getTimeStampFromDate,
		getDateFromTimeStamp: getDateFromTimeStamp,
		getFriendlyDate: getFriendlyDate,
		getFriendlyDateTimeStamp: getFriendlyDateTimeStamp,
		convertUserInputToDate: convertUserInputToDate
	};
});