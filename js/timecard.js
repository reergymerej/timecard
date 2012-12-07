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

		$( '#control-toggle' )
			.click(function(){
				var toggleButton = $(this);
				$(this).siblings('.content').slideToggle(function(){
					$('span', toggleButton).toggleClass('ui-icon-carat-1-n ui-icon-carat-1-s');
				});
			})
			.hover(
				function() {
					$( this ).addClass( "ui-state-hover" );
				},
				function() {
					$( this ).removeClass( "ui-state-hover" );
				}
			);

		recorder.start();
	});
});