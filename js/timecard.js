
$(function(){

	$('.recorder-controls').hide();
	$('#summary_form').hide();

	$('button, input[type="submit"]').button();

	require(['graph', 'util'], function(graph, util){

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


		//	load or start recording?
		$('#record')
			.click(function(){

				g = new graph.Graph( $('#graph') );
				g.record();
				$(this).parent().remove();
				$('.recorder-controls').show();
			});

		$('#load')
			.click(function(){
				
				$('#summary_form')
					.show()
					.submit(function(){
						var start = $('#start').val(),
							end = $('#end').val() || String(new Date().getHours() + 1);

						g = new graph.Graph( $('#graph') );

						//	convert these values into dates
						start = util.convertUserInputToDate(start).getTime();
						end = util.convertUserInputToDate(end).getTime();

						g.load( start, end );

						$(this).hide();
						return false;
					});
				$(this).parent().remove();
				$('.recorder-controls').remove();			
			});
	});
});