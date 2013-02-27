define([
	'text!templates/summaryTemplate.html',
	'collections/TaskCollection',
	'util',
], function(
	summaryTemplate,
	TaskCollection,
	util
){

	var SummaryView = Backbone.View.extend({
		el: $('#page'),
		
		initialize: function(){

			var that = this;

			this.collection = new TaskCollection();

			this.collection.on('remove', function(model, collection, options){
				model.destroy({
					success: function(model, response){
						//	TODO use subviews rather than refreshing everything here
						that.render();
					}
				})
			});
		},

		render: function(){
		
			var formData = {},
				template,
				now = Date.now();

			formData = {
				start: util.timeTo(now, util.DATE),
				end: util.timeTo(now, util.DATETIME),
				tasks: this.collection.toJSON()
			};

			template = _.template( summaryTemplate, formData );

			this.$el.html(template);
		},

		events: {
			'submit form': 'loadTasks',
			'click button.remove': 'removeTask'
		},
		
		loadTasks: function(){
			
			var start,
				end,
				form,
				that;

			that = this;

			//	gather data from form
			form = $('form');
			start = $('.start', form).val();
			end = $('.end', form).val();

			start = util.userInputToTime(start);
			end = util.userInputToTime(end);

			//	update the collection
			this.collection.fetch({
				
				data: {
					start: start,
					end: end
				},

				success: function(collection, response, options){
					console.log(collection.toJSON());
					that.render();
				},

				error: function(collection, xhr, options){
					console.error('unable to fetch collection', xhr.responseText);
				}
			})

			return false;
		},

		removeTask: function(ev){
			var taskID = $(ev.currentTarget).attr('name'),
				task = this.collection.get(taskID);

			this.collection.remove(task);
		}
	});

	return SummaryView;
});