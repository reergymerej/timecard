define([
'models/Task'
], function(Task){
	
	console.log('task', Task);

	var TaskCollection = Backbone.Collection.extend({
		model: Task
	});

	return TaskCollection;
});