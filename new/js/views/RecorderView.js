define([
	'text!templates/recorderTemplate.html'
], function(recorderTempate){

	var RecorderView = Backbone.View.extend({
		el: $('#page'),
		render: function(){
			this.$el.html(recorderTempate);
		}
	});

	return RecorderView;
});