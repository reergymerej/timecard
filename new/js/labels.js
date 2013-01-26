/**
* Used to get distinct labels from server and current tasks.  This should probably not be a separate module,
* but I'm putting it here until I can refactor everything.
**/

define(function(){

	var TEST_DATA = '["ants","Augie","Augie - call","Augie - chat","bathroom","break","bug 129181","bug 129735","bug 129743","bug 129752","bug 129756","bug 129835","bug 129844","bug 129847","bug 129860","bug 129882","bug 129885","bug 129893","bug 129920","bug 178","bug 198","bug 211","bug 217","bug 218","bug 219","bug 220","bug 221","bug 222","bug 223","bug 224","bug 225","bug 226","Bugs - Lotus","change insurance","Claudio","Claudio - chat","Claudo","component interface","config server","documentation","Ed","Ed - training","email","enter bug","find JSON problem","get snacks","goofing around","grids","help web guys","Ian","Ian - chat","Kasey","Kasey - chat","label","label a","label b","label c","label d","label e","label f","log in","look ups","lookup components","lookups","lunch","manage issues","Marty - chat","meeting","meeting - Zeke","migrate site","move bugs into Lotus","network issues","organize issues","personal","phone call","POS","pos main buttons","refactor grid","Rob - chat","Robert","Robert - call","Scott","set up phone","smoke","smoke break","status meeting","studying REST","Sunill","Sunill - call","Sunill - chat","try to get online","update server","Zeke","Zeke - chat"]';

	var labels = [];	

	getLabelsFromServer(function(freshLabels){
		labels = freshLabels;
	});

	/**
	* @param {function} callback, passed array
	**/
	function getLabelsFromServer(callback){
		var labels = [];

		$.ajax({
			type: 'GET',
			url: 'php/labels.php',

			error: function(){
				console.error('unable to fetch labels', arguments);
			},

			success: function(resp){
				
				resp = JSON.parse(resp);
				
				if(resp.status){
					labels = resp.data;
				} else {
					console.error(resp.message);
					console.warn('using test data instead');
					labels = JSON.parse(TEST_DATA);
				};
			},

			complete: function(){
				callback(labels);
			}
		});
	};


	/**
	* public getter for labels
	* @return {array}
	**/
	function getLabels(){
		return labels;
	};


	/**
	* add a new label to our array, if it is actually new
	* @param {string} newLabel
	**/
	function addLabel(newLabel){
		if(labels.indexOf(newLabel) === -1){
			labels.push(newLabel);
			labels.sort();
		};
	};

	return {
		getLabels: getLabels,
		addLabel: addLabel
	};
});