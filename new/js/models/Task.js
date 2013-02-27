define([
], function(){
	var Task = Backbone.Model.extend({
		defaults: function(){
			return {
				start: Date.now()
			};
		}
	});

	return Task;
});