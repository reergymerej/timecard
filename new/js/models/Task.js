define([
], function(){
	var Task = Backbone.Model.extend({
		defaults: function(){
			return {
				created: Date.now(),
				start: Date.now()
			};
		}
	});

	return Task;
});