define(function(){
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

	return {
		getFriendlyTimeStamp: getFriendlyTimeStamp,
		getFriendlyDateTimeStamp: getFriendlyDateTimeStamp,
		convertSecondsToTime: convertSecondsToTime,
		convertUserInputToDate: convertUserInputToDate
	};
});