define([
	'views/RecorderView'
], function(RecorderView){
	
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
			console.log('summary');
		});

		Backbone.history.start();
	};

	return {
		initialize: initialize
	};
});