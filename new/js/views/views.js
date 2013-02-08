define(['js/util'], function(util){

	var graphStart;

	var TaskGroupView = Backbone.View.extend({
		initialize: function(){
			var that = this;
			var template = _.template( $('#task-group-view').html());
			this.$el.append(template).prependTo( $('.recorder') );
			this.render();

			this.model.set({taskContainer: this.$el.find('.tasks')});

			//	listen to model for changes
			this.model.on('change:label', function(){
				that.render();
			});
			this.model.on('change:running', function(){
				that.renderToggle();
			});
		},
		render: function(){
			this.$el.find('.taskGroupLabel').html(this.model.get('label'));
		},
		renderToggle: function(){
			var that = this;

			this.$el.find('.toggle > span').toggleClass('icon-play icon-pause');

			this.$el.slideUp(function(){
				that.$el.prependTo($('.recorder')).slideDown();
			});

			// if(this.model.get('running') && this.$el.find('.end').val() !== $('.recorder > div').first().find('.end').val()){
			// 	this.$el.slideUp(function(){
			// 		that.$el.prependTo($('.recorder')).slideDown();
			// 	});
			// };
		},
		events: {
			'click .toggle': 'toggle',
			'click .taskGroupLabel': 'modifyLabel'
		},
		toggle: function(){
			this.model.toggle();
		},
		modifyLabel: function(){
			var label = this.$el.find('.taskGroupLabel'),
				input = $('<input>'),
				that = this;

			label.after(input).hide();

			input
			.val(this.model.get('label'))
			.focus()
			.blur(function(){
				var input = $(this);
				that.model.set({label: input.val()});
				input.hide();
				label.show();
			});
		}
	});

	var TaskView = Backbone.View.extend({
		initialize: function(){
			
			var that = this;
			var template = _.template( $('#task_view_template').html(), {} );
			this.$el.html( template );
			this.options.container.prepend( this.el );
			this.render();

			//	rerender when model changes
			this.model.on('change:start change:end change:label', function(){
				that.render();
			});

			this.model.on('change:scale', function(){
				that.rescale();
			});
		},
		render: function(){

			var start = this.model.get('start'),
				end = this.model.get('end');

			var that = this;

			start = new Date(this.model.get('start'));
			start = util.getTimeStampFromDate(start);

			if(end){
				end = new Date(this.model.get('end'));
				end = util.getTimeStampFromDate(end);
			};

			this.$el.find('.start').val(start);
			this.$el.find('.end').val(end);
		},
		events: {
			'click': 'showTaskModifier',
			'hover': 'hover'
		},
		hover: function(ev){
			var task = this.$el.find('.task');

			if(ev.type === 'mouseenter'){
				task.css('box-shadow', '0px 0px 15px ' + task.css('border-color'));
			} else {
				task.css('box-shadow', '');
			};
			
		},
		showTaskModifier: function(){
			var mod = new TaskModifierView({
				taskModel: this.model,
				taskView: this
			});
		},
		deleteTask: function(){
			var that = this;
			this.model.destroy({
				success: function(){
					that.remove();
				}
			});
		},
		saveTask: function(){
			var start,
				end;

			start = this.$el.find('.start').val();
			start = util.getDateFromTimeStamp(start).getTime();

			end = this.$el.find('.end').val();
			if(end){
				end = util.getDateFromTimeStamp(end).getTime();
			};

			this.model.set({
				start: start,
				end: end
			});

			this.model.save();
		},
		rescale: function(){
			var 
				/**
				* difference between the start of this graph and now
				* @property timeSpan
				* @type number
				**/
				timeSpan,

				/**
				* current width of the .tasks element that contains this .task
				* @property timelinePixels
				* @type number
				**/
				timelinePixels,
				left,
				width,

				MIN_WIDTH = 20,
				start,
				end;

			timeSpan = Date.now() - graphStart;
			timelinePixels = this.$el.closest('.tasks').width();
			start = this.model.get('start');
			end = this.model.get('end');

			left = Math.max( 0, (start - graphStart) / timeSpan * timelinePixels );
			width = end ? (end - start) / timeSpan * timelinePixels : timelinePixels - left;
			width = Math.max(width, MIN_WIDTH);

			this.$el.find('.task').css({
				left:left,
				width:width
			});
		}
	});

	var TaskModifierView = Backbone.View.extend({
		initialize: function(){

			var template = _.template( $('#task_modifier_view_template').html(), {} );
			this.$el.html(template);
			this.$el.appendTo( this.options.taskView.$el.find('.task') );
			this.render();
		},

		render: function(){
			var start = this.options.taskModel.get('start'),
				end = this.options.taskModel.get('end');

			start = util.getTimeStampFromDate(new Date(start));
			if(end){
				end = util.getTimeStampFromDate(new Date(end));
			};

			this.$el.find('input').first().focus();
			$('.start', this.$el).val(start);
			$('.end', this.$el).val(end);
		},

		events: {
			'click': 'preventBubble',
			'submit form': 'submitForm',
			'click .delete': 'deleteTask'
		},

		preventBubble: function(ev){
			ev.stopPropagation();
		},

		submitForm: function(){

			var start = $('.start', this.$el),
				end = $('.end', this.$el);

			start = util.getDateFromTimeStamp(start.val());
			end = util.getDateFromTimeStamp(end.val());

			start = start.getTime();
			if(end){
				end = end.getTime();
			};

			this.options.taskModel.set({
				start: start,
				end: end
			});

			this.remove();
			return false;
		},

		deleteTask: function(){

			var that = this,
				taskModel = this.options.taskModel,
				taskView = this.options.taskView;

			taskModel.destroy({
				success: function(){
					that.remove();
					taskView.remove();
				}
			});
		}
	});

	/**
	* Created by SummaryModel
	**/
	var SummaryView = Backbone.View.extend({
		initialize: function(){

			var that = this;

			console.log('I am a new SummaryView.');

			this.render();

			//	listen
			this.model.on('change', function(){
				that.render();
			});
		},
		render: function(){
			var vars = {
				start: util.getFriendlyDate( this.model.get('start') ),
				end: util.getFriendlyDateTimeStamp( this.model.get('end') )
			};
			
			var template = _.template( $('#summary_view').html(), vars );
			
			this.$el.empty().html(template);
		},
		events: {
			'submit form': 'submit'
		},
		submit: function(){
			var start = $('.start', this.$el).val(),
				end = $('.end', this.$el).val();

			//	convert values to times
			start = util.convertUserInputToDate(start);
			end = util.convertUserInputToDate(end);

			this.model.set({
				start: start,
				end: end
			});

			return false;
		}
	});

	/**
	* Each task in the SummaryModel's collection will create one of these.
	**/
	var SummaryTaskView = Backbone.View.extend({
		initialize: function(){
			console.log('I am a new SummaryTaskView.');

			var template = _.template( $('#task-summary-view').html(), { task: this.model.toJSON() } );
			this.$el.html( template );
		},
		render: function(){

		}
	});

	var SubViewTest = Backbone.View.extend({
		render: function(){
			var template = _.template( $('#sub_view_test').html(), {});
			this.$el.html(template);
		}
	});

	/**
	* @param {number} time
	**/
	function setGraphStart(time){
		if(graphStart === undefined){
			graphStart = time;
		};
	};

	return {
		TaskGroupView: TaskGroupView,
		TaskView: TaskView,
		TaskModifierView: TaskModifierView,
		SummaryView: SummaryView,
		setGraphStart: setGraphStart,
		SummaryTaskView: SummaryTaskView
	};
});