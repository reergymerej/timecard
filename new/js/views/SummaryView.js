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
			this.collection = new TaskCollection();
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
			'submit form': 'loadTasks'
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
		}
	});

	return SummaryView;
});