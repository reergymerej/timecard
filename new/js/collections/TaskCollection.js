define([
	'models/Task'
], function(
	Task
){
	
	var TaskCollection = Backbone.Collection.extend({
		
		model: Task,

		url: 'php/api/Task/'
	});

	return TaskCollection;
});