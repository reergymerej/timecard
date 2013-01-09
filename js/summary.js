define(['graph'], function(graphModule){

	var CATEGORY = 'category';


	function Summary(tasks){

		var historyProxy = new graphModule.HistoryProxy('whatever', 0),
			tasks;

		historyProxy.load(start, end, function(t){
			tasks = groupBy(CATEGORY, t);

			tasks.sort(function(a, b){
				return b.duration - a.duration;
			});

			console.log(tasks);
		});
	};


	/**
	* @param {string} prop
	* @param {array} arr
	* @return {array} 
	**/
	function groupBy(prop, arr){

		var grouped = [],
			index;

		for(var i = 0; i < arr.length; i++){
			index = getIndex( prop, grouped, arr[i][prop] );

			if( index === -1 ){
				index = grouped.push({ duration: 0 }) - 1;
				grouped[index][prop] = arr[i][prop];
			};

			grouped[index].duration += parseInt(arr[i].duration, 10);
		};

		return grouped;

		/**
		* find the index of the object in array with matching property
		**/
		function getIndex(prop, arr, needle){
			for(var i = 0; i < arr.length; i++){
				if(arr[i][prop] === needle){
					return i;
				};
			};

			return -1;
		};
	};

	return {
		Summary: Summary
	}
});