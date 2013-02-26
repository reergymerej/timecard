define([
], function(){
	var Task = Backbone.Model.extend({
		defaults: function(){
			return {
				created: Date.now()
			};
		}
	});

	return Task;
});