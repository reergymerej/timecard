
$(function(){
	require(['graph'], function(graph){

		var g;

		//	set up components, event listeners handled in modules
		$( '#refresh-interval').slider({
			min: 1,
			max: 60,
			value: 10
		});

		$( '#save-interval' ).slider({
			min: 5,
			max: 120,
			value: 120,
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


		g = new graph.Graph( $('#graph') );
		g.record();
		//g.load( Date.now() - (1000 * 60 * 30 ), Date.now() - (1000 * 60 * 15) );
	});
});