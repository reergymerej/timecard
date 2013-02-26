define([
	'views/RecorderView',
	'views/SummaryView'
], function(
	RecorderView,
	SummaryView
){
	
	var AppRouter = Backbone.Router.extend({
		routes: {
			'record': 'showRecorder',
			'summary': 'showSummary'
		}
	});


	function initialize(){
		var router = new AppRouter();

		router.on('route:showRecorder', function(){
			var recorderView = new RecorderView();
			recorderView.render();
		});

		router.on('route:showSummary', function(){
			var summaryView = new SummaryView();
			summaryView.render();
		});

		Backbone.history.start();
	};

	return {
		initialize: initialize
	};
});