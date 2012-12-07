$(function(){
	require(['recorder'], function(recorder){

		//	set up components, event listeners handled in modules
		$( '#refresh-interval').slider({
			min: 1,
			max: 60,
			value: 10
		});

		$( '#save-interval' ).slider({
			min: 5,
			max: 120,
			value: 5,
			step: 5
		});

		recorder.start();
	});
});