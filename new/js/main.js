//	configure Requirejs
require.config({
	// baseUrl: 'js',
	paths: {
		'routers': 'routers',
		'views': 'views',
		'collections': 'collections',
		'models': 'models',
		'templates': '../templates'
	},
	urlArgs: '_' + Date.now()
});


//	load app
$(function(){
	require(['app'], function(App){
		App.initialize();
	});
});


// //	load modules
// $(function(){
// 	require(['models/models',
// 			'views/views'],
// 	function(models,
// 			views){

// 		var AppRouter = Backbone.Router.extend({
// 			routes: {
// 				'record': 'startRecorder',
// 				'summary': 'loadSummary'
// 			}
// 		});

// 		var router;
// 		var taskCollection;
// 		var pageView;


// 		//	These probably shouldn't live here.
// 		var taskGroups = [];

// 		router = new AppRouter;
		
// 		router.on('route:startRecorder', function(){
// 			$('#startRecorder').attr('disabled', 'disabled');
// 			$('#loadSummary').removeAttr('disabled');
// 			record();
// 		});

// 		router.on('route:loadSummary', function(){
// 			$('#loadSummary').attr('disabled', 'disabled');
// 			$('#startRecorder').removeAttr('disabled', 'disabled');
// 			summary();
// 		});


// 		/**
// 		* load the view for the recorder so we can start recording tasks
// 		**/
// 		function record(){
// 			var template = _.template( $('#recorder').html(), {} );
// 			$('.page').empty().html(template);


// 			$('.new-taskGroup').click(function(){

// 				views.setGraphStart(Date.now());

// 				var taskGroup = new models.TaskGroupModel();
// 				var taskGroupView = new views.TaskGroupView({
// 					model: taskGroup
// 				});

// 				taskGroup.addTask();

// 				taskGroups.push(taskGroup);
// 			});

// 			//	start scaling graph
// 			setInterval(refreshGraph, 1000);
// 		};	


// 		/**
// 		* load the summary page
// 		**/
// 		function summary(){
// 			var summaryModel = new models.SummaryModel();
// 			pageView = new views.SummaryView({
// 				model: summaryModel
// 			});
// 		};

// 		Backbone.history.start();

// 		/**
// 		* tell each TaskGroup to rescale its Tasks
// 		**/
// 		function refreshGraph(){
// 			for(var i = 0; i < taskGroups.length; i++){
// 				taskGroups[i].scaleTasks();
// 			};
// 		};
// 	});
// });
