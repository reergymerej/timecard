define(['graph',
		'util'],
function(graphModule,
		util){

	var CATEGORY = 'category',
		summaryLines = [];

	var SummaryLineView = Backbone.View.extend({
		initialize: function(){
			this.render();
		},
		render: function(){
			var variables = {
				label: this.options.category,
				duration: util.convertSecondsToTime(this.options.duration)
			};
			var template = _.template( $('#summary_lineitem_template').html(), variables );
			this.$el.html(template);

			console.log(this);

			$('#summary').append(this.$el);
		}
	});


	function Summary(start, end){

		var historyProxy = new graphModule.HistoryProxy('whatever', 0);

		historyProxy.summary(start, end, function(t){
			createViews(t);
		});


		/**
		* Create views with the summary info received from the server.
		* @param {array} tasks
		**/
		function createViews(tasks){

			$('#summary').empty();
			summaryLines = [];

			for(var i = 0; i < tasks.length; i++){
				summaryLines.push(new SummaryLineView(tasks[i]));
			};
		};
	};


	return {
		Summary: Summary
	}
});