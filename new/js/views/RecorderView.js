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

			this.$el.html(recorderTempate);

			this.start = Date.now();

			setInterval(this.render.bind(this), 2000);
		},

		render: function(){

			var that = this;

			//	TODO trigger an event that groups will subscribe to to manage their own rendering
			$.each(this.groups, function(i, group){
				group.render({
					graphStart: that.start
				});
			});
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