
$(function(){

	$('.recorder-controls').hide();
	

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
				
				var form;
				form = new SummaryFormView();
			});

		var SummaryFormView = Backbone.View.extend({

			initialize: function(){
				this.render();
			},

			render: function(){

				//	compile template
				var template = _.template( $('#summary_form_template').html() );

				//	load compiled template
				this.$el.html( template );

				$('#mainControls').hide();

				//	attach to DOM
				this.$el.appendTo( 'body' );

				$('input[type="submit"]', this.$el).button();
				$('input[type="text"]').datepicker();

			},

			events: {
				'submit': 'load'
			},

			load: function(){

				var startEl = $('#start', this.$el),
					start,
					end;

				start = startEl.val(),
				end = $('#end', this.$el).val() || String(new Date().getHours() + 1);
				
				start = util.convertUserInputToDate(start);

				if(!start){
					startEl.focus();
					return false;
				};

				//	convert these values into dates
				start = start.getTime();
				end = util.convertUserInputToDate(end).getTime();

				require(['summary'], function(summaryModule){
					var summary = new summaryModule.Summary(start, end);
				});

				return false;
			}
		});
	});
});