define([
	'text!templates/recorderTemplate.html',
	'collections/TaskCollection',
	'views/TaskGroupView'
], function(
	recorderTempate,
	TaskCollection,
	TaskGroupView
){

	var RecorderView = Backbone.View.extend({
		
		el: $('#page'),

		initialize: function(){

			/**
			* holds collections of tasksGroupViews, 
			* each of which manage their own TaskCollections
			* @property groups
			* @type array
			**/
			this.groups = [];
		},

		render: function(){
			this.$el.html(recorderTempate);
		},

		events: {
			'click #new-group': 'newGroup'
		},

		newGroup: function(){
			var newGroupEl = $('<div>').appendTo('.recorder');

			this.groups.push( new TaskGroupView({el: newGroupEl}) );
			console.log('groups', this.groups);
		}
	});

	return RecorderView;
});