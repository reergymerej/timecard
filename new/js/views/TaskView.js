define([
	'text!templates/taskTemplate.html'
], function(
	taskTemplate
){

	var TaskView = Backbone.View.extend({
		initialize: function(){
			var template = _.template(taskTemplate, {});
			this.$el.html(template);
			console.log('I am initialized');
		},

		render: function(data){
			//	position
			console.log('TaskView render', data);

			var MIN_WIDTH = 20;
			var timeSpan = Date.now() - data.graphStart;
			var start = this.model.get('start');
			var end = this.model.get('end');

			var left = Math.max( 0, (start - data.graphStart) / timeSpan * data.width );
			var width = end ? (end - start) / timeSpan * data.width : data.width - left;
			width = Math.max(width, MIN_WIDTH);

			// console.log(left, width);

			$('.task', this.$el).css({
				width: width,
				left: left
			});
		}
	});

	return TaskView;
});