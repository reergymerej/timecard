/**
* reusable utility methods
* @module util
**/

define(function(){
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
		if(typeof time === 'number'){
			time = new Date(time);
		};

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

		if(!time){
			return '';
		};

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

	function rand(min, max){
		return min + Math.floor(Math.random() * (max - min + 1));
	};


	/**
	* perform an AJAX call
	* @param {string} url
	* @param {object, string} data to send or 'GET'
	* @param {function} callback, passed (success boolean, response string)
	**/
	function ajax(url, data, callback){
		
		var type = 'POST',
			success = false,
			response = '';

		if(data === 'GET'){
			type = 'GET';
			data = undefined;
		}

		$.ajax({
			type: type,
			url: url,
			data: data,
			cache: false,
			success: function(resp){
				success = true;
				response = resp;
			},
			error: function(){
				console.error('ajax error');
			},
			complete: function(){
				callback(success, response);
			}
		});
	};


	/**
	* Used to abstract saving from where data is actually saved.  Provides a single interface for saving to localStorage or db.
	* @class HistoryProxy
	* @constructor
	* @param {number} userID
	**/
	function HistoryProxy(userID){

		var userID = userID;

		/**
		* save tasks to the database, locally if there was a failure
		* @method saveTasks
		* @param {array} newTasks
		* @param {number} userID
		* @param {number} start beginning of timeframe for this Graph
		**/
		function saveTasks(newTasks, userID, start){

			console.log('saving @ ' + new Date());
			console.log(newTasks);

			var saveUrl = 'php/save.php',
				tasksJSON = JSON.stringify(newTasks);

			ajax(saveUrl, 
				{
					tasks: newTasks,
					timeframe: {
						start: start,
						end: Date.now(),
						userID: userID
					}
				}, function(success, resp){
					if(success){
						var response = JSON.parse(resp);
						console.log(response);

						if(response.status){
							console.log('saved successfully');
							console.log(response.message);
							//	clear locally stored
							clearLocal();
						} else {
							console.error('error saving');
							console.log(response.message);
						};
					};
				});
		};


		/**
		* Load saved tasks from the database, execute callback.
		* @method load
		* @param {number} start
		* @param {number} end
		* @param {function} callback passed array of tasks loaded
		**/
		function load(start, end, callback){

			var loadUrl = 'php/load.php';

			ajax(loadUrl, {
					timeframe: {
						start: start,
						end: end,
						userID: userID
					}
				}, function(success, resp){

					var response;
								
					if(success){
						response = JSON.parse(resp);
						if(response.status){
							console.log('loaded successfully');
							console.log(response.message);
							console.log(response.data);
							callback(response.data);
						} else {
							console.error('error loading tasks');
							console.error(response.message);
						};
					} else {
						console.error('ajax error while loading tasks');
					};				
				});
		};


		/**
		* Get a summary of tasks.
		* @method summary
		* @param {number} start
		* @param {number} end
		* @param {function} callback, passed array
		**/
		function summary(start, end, callback){

			var taskSummary = [];
			var TEST_DATA = '[{"category":"email","duration":"5411"},{"category":"grids","duration":"5006"},{"category":"component interface","duration":"4566"},{"category":"Robert","duration":"4429"},{"category":"update server","duration":"3399"},{"category":"POS","duration":"3143"},{"category":"Claudio","duration":"1867"},{"category":"smoke break","duration":"1635"},{"category":"POS - data structure","duration":"1007"},{"category":"pay screen","duration":"808"},{"category":"lunch","duration":"669"},{"category":"lookups","duration":"484"},{"category":"bathroom","duration":"237"},{"category":"label","duration":"82"},{"category":"organize issues","duration":"22"}]';

			$.ajax({
				type: 'POST',
				url: 'php/summary.php',
				data: {
					timeframe: {
						start: start,
						end: end,
						userID: userID
					}
				},

				error: function(){
					console.error('unable to fetch summary', arguments);
				},

				success: function(resp){
					
					resp = JSON.parse(resp);
					
					if(resp.status){
						taskSummary = resp.data;
					} else {
						console.error(resp.message);
						console.warn('using test data instead');
						taskSummary = JSON.parse(TEST_DATA);
					};
				},

				complete: function(){
					callback(taskSummary);
				}
			});
		};

		
		/**
		* save task locally in array
		**/
		function storeLocal(start, end, category){
			var unsavedTasks = getUnsavedTasksLocal();

			unsavedTasks.push({
				start: start,
				end: end,
				category: category
			});

			//	convert back to JSON for storage
			localStorage.unsavedTasks = JSON.stringify(unsavedTasks);
		};


		function clearLocal(){
			delete localStorage.unsavedTasks;
		};

		/**
		* @return {array}
		**/
		function getUnsavedTasksLocal(){
			var unsavedTasks = localStorage.unsavedTasks;

			try {
				unsavedTasks = JSON.parse(unsavedTasks);
			} catch(e){
				unsavedTasks = [];
			};

			return unsavedTasks;
		};

		
		/**
		* @param {function} callback, passed array
		**/
		function getActiveTasks(callback){
			var unsavedLocal = getUnsavedTasksLocal();

			console.warn('need query to get only unfinished tasks');
			console.info('We should probably rethink this whole thing.  Maybe have a flag for "day complete" or something and only resume with those.');

		};

		//	public
		this.saveTasks = saveTasks;
		this.storeLocal = storeLocal;
		this.load = load;
		this.summary = summary;
		this.getActiveTasks = getActiveTasks;
	};

	return {
		getFriendlyTimeStamp: getFriendlyTimeStamp,
		getFriendlyDateTimeStamp: getFriendlyDateTimeStamp,
		convertSecondsToTime: convertSecondsToTime,
		convertUserInputToDate: convertUserInputToDate,
		rand: rand,
		ajax: ajax,
		HistoryProxy: HistoryProxy
	};
});