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
				duration: util.convertSecondsToTime(this.options.duration),
				percentage: this.options.percentage
			};
			var template = _.template( $('#summary_lineitem_template').html(), variables );
			this.$el.html(template);

			$('#summary').append(this.$el);
		}
	});


	function Summary(start, end){

		var historyProxy = new util.HistoryProxy(0);

		historyProxy.summary(start, end, function(t){
			createViews(t);
		});


		/**
		* Create views with the summary info received from the server.
		* @param {array} tasks
		**/
		function createViews(tasks){

			var totalDuration = getTotalDuration(tasks),
				percentage;

			$('#summary').empty();
			summaryLines = [];

			for(var i = 0; i < tasks.length; i++){
				tasks[i].percentage = Math.round(tasks[i].duration / totalDuration * 10000) / 100;
				summaryLines.push(new SummaryLineView(tasks[i]));
			};

			/**
			* @param {array} tasks
			* @return {number}
			**/
			function getTotalDuration(tasks){
				var total = 0;

				for(var i = 0; i < tasks.length; i++){
					total += parseInt(tasks[i].duration, 10);
				};

				return total;
			};
		};
	};


	return {
		Summary: Summary
	}
});