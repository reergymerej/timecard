define(['util'], function(util){

	function Graph(element){
		var taskGraphElement = element,
			newTaskButton,
			controls,
			taskLines = [],
			startTime = Date.now(),
			endTime,
			refreshSlider = $('#refresh-interval'),
			saveSlider = $('#save-interval'),
			refreshInterval = 100,
			saveInterval = 30000,
			refreshTimeoutHandle,
			saveTimeoutHandle,
			userID = userID || 0,
			taskManager = new TaskManager(userID);


		//	set css
		taskGraphElement.css({
			position: 'relative'
		});

		taskGraphElement.addClass('taskGraph');

		//	new task button
		newTaskButton = $('<button>')
			.text('new task')
			.click(function(){
				addTaskGroup();
			});

		//	wrapper for controls
		controls = $('<div>').append(newTaskButton);
		taskGraphElement.before(controls);

		newTaskButton.button();
		
		/**
		* Rescale the graph.
		* @param {booelan} [recurring=true] If set, will schedule another adjustGraph automatically.
		**/
		function adjustGraph(recurring){
			var timeSpan,
				recurring = recurring === undefined ? true : false;

			//	set timeframe
			if(recurring){
				timeSpan = Date.now() - startTime;
			} else {
				timeSpan = endTime - startTime;
			};

			//	adjust the TaskLines
			for(var i = 0; i < taskLines.length; i++){
				taskLines[i].scale(startTime, timeSpan);
			};

			showTicks(timeSpan, startTime);

			if(recurring){
				//	clear old timeout
				clearTimeout(refreshTimeoutHandle);

				//	set up next refresh	
				maxRefreshInterval = getRefresh();
				refreshInterval = Math.min(refreshInterval * 1.3, maxRefreshInterval);
				refreshTimeoutHandle = setTimeout(adjustGraph, refreshInterval);
			};

			function getRefresh(){
				return Math.pow(refreshSlider.slider('option', 'value'), 3);
			};


			/**
			* Show ticks on graph relative to current timespan.
			* @param {number} timeSpan
			* @param {number} startTime
			**/
			function showTicks(timeSpan, startTime){

				var MAX_TICKS = 4,
					interval = Math.floor( (timeSpan / MAX_TICKS) ),
					ticksWidth = $('.ticks').innerWidth(),
					width = ticksWidth / MAX_TICKS - 1;	// 1 for left border

				//	clear out old ticks
				$('.ticks').empty();

				//	hack
				$('.ticks')
					.css('width', $('.timeline').width() + 'px')
					.insertAfter( $('.taskLine').last() );

				for(var i = 0; i < MAX_TICKS; i++){
					$('.ticks').append(
							$('<span>')
								.addClass('tick')
								.text( util.getFriendlyTimeStamp(startTime + i * interval) )
								.css('left', i*width + 'px')
						);
				};
			};
		};


		/**
		* @param {object} [tasks] if provided, loads these tasks into the group
		* @param {string} [tasks.category]
		* @param {array} [tasks.tasks]
		**/
		function addTaskGroup(tasks){
			var taskGroup = new TaskGroup(tasks);

			taskLines.push(taskGroup);
			taskManager.addTaskGroup(taskGroup);
			taskGraphElement.prepend(taskGroup.getElement());
		};

		function showSummary(start, end){
			var summary = taskManager.getSummary(start, end),
				summaryContainer = $('#summary');

			//	empty existing summary
			summaryContainer.empty();

			for(var i = 0; i < summary.length; i++){			
				summaryContainer.append($('<div>').text(summary[i]));
			};
		};

		function save(){
			//	clear out pending saves
			clearTimeout(saveTimeoutHandle);

			//	save
			taskManager.save(startTime);

			//	set up next save
			saveTimeoutHandle = setTimeout(save, $('#save-interval').slider('option', 'value') * 1000);
		};

		/*********************************
				public interface
		*********************************/
		
		/**
		* Start using this graph to record new events.
		**/
		function record(){
			console.log('start recording');

			//	add listeners to sliders
			refreshSlider.on('slidechange', function(event, ui){
				console.log('refresh interval', ui.value);
				adjustGraph();
			});

			saveSlider.on('slidechange', function(event, ui){
				console.log('save interval', ui.value);
				save();
			});

			//	start clock
			refreshTimeoutHandle = setTimeout(adjustGraph, refreshInterval);

			//	start auto-saving
			saveTimeoutHandle = setTimeout(save, saveInterval);
		};


		/**
		* Load a previously saved group of events for review/editing.
		* @param {number} start
		* @param {number} end
		**/
		function load(start, end){

			startTime = start;
			endTime = end;

			taskManager.load(start, end, function(tasks){

				var categories = [];

				//	replace old info with info from loaded tasks
				taskManager = new TaskManager(userID)

				//	identify unique categories
				for(var i = 0; i < tasks.length; i++){
					if( categories.indexOf( tasks[i].category ) === -1 ){
						categories.push( tasks[i].category );
					};
				};

				//	create new categories, pass all tasks that belong to this category
				for(var i = 0; i < categories.length; i++){
					addTaskGroup({
						tasks: getTasksOfCategory( categories[i], tasks ),
						category: categories[i]
					});
				};

				adjustGraph(false);

				/**
				* Returns an array of tasks that match this category.
				* @param {string} c category
				* @param {array} tasks searched for matches
				* @return {array}
				**/
				function getTasksOfCategory(c, tasks){
					var matches = [];

					for(var i = 0; i < tasks.length; i++){
						if(tasks[i].category === c){
							matches.push( tasks[i] );
						};
					};

					return matches;
				};
			});
		};

		return {
			record: record,
			load: load
		};
	};


	/**
	* @param {number} userID
	**/
	function TaskManager(userID){
		var taskGroups = []
			history = new HistoryProxy('localStorage', userID);

		function addTaskGroup(tg){
			taskGroups.push(tg);
		};

		/**
		* @param {number} start beginning of this TimeGraph
		**/
		function save(start){

			var categoriesUsed = [],
				category,
				tasksUsed = [],
				start = start;
			
			//	capture current organization of Tasks and TaskGroups
			for(var i = 0; i < taskGroups.length; i++){
				
				taskGroups[i].save();

				//	concatenate so arrays returned from TaskGroup are combined into one
				tasksUsed = tasksUsed.concat(taskGroups[i].getTasks());

				//	collect categories used
				category = taskGroups[i].getCategory();
				if(categoriesUsed.indexOf(category) === -1){
					categoriesUsed.push(category);
				};
			};

			if(tasksUsed.length > 0){
				history.saveTasks(tasksUsed, userID, start);
			};
		};


		/**
		* Load saved tasks for this manager to use.
		* @param {number} start
		* @param {number} end
		* @param {function} callback passed array of tasks
		**/
		function load(start, end, callback){

			history.load(start, end, function(tasks){
				callback(tasks);
			});
		};

		function getSummary(start, end){
			
			var tasks = history.getTasks(start, end);

			//	sort tasks by start
			tasks.sort(function(a, b){
				return a.start - b.start;
			});

			//	add additional info to each task
			for(var i = 0; i < tasks.length; i++){
				
				if(tasks[i].duration){
					tasks[i].end = util.getFriendlyDateTimeStamp(new Date(tasks[i].start + tasks[i].duration * 1000));
					tasks[i].duration = util.convertSecondsToTime(tasks[i].duration);
				} else {
					tasks[i].end = 'now';
					tasks[i].duration = util.convertSecondsToTime( Math.round( (Date.now() - tasks[i].start) / 1000) );
				};

				tasks[i].start = util.getFriendlyDateTimeStamp(new Date(tasks[i].start));

				tasks[i] = tasks[i].start + ' - ' + tasks[i].end + ' (' + tasks[i].duration + ') : ' + tasks[i].category;
			};

			return tasks;
		};

		//	public
		return {
			addTaskGroup: addTaskGroup,
			save: save,
			load: load,
			getSummary: getSummary
		}
	};


	/**
	* @param {object} [tasks] if provided, loads these tasks into the group
	* @param {string} [tasks.category]
	* @param {array} [tasks.tasks]
	**/
	function TaskGroup(preload){
		var publicInterface = {},
			taskLineElement,
			timeline,
			timelineWidth,	// update this on window resize
			controls,
			toggle,
			label,
			category = ( preload !== undefined ) ? preload.category : undefined,
			tasks = [];

		/*********************************
				public interface
		*********************************/

		publicInterface = {
			getElement: getElement,
			getCategory: getCategory,
			getTasks: getTasks,
			scale: scale,
			save: save,
			deleteTask: deleteTask,
			addTask: addTask
		};

		taskLineElement = $('<div>').addClass('taskLine ui-corner-all ui-widget-content');

		timeline = $('<div>').addClass('timeline');
		controls = $('<div>').addClass('controls');

		//	initialize
		if(preload === undefined){
			addTask();
		} else {
			for(var i = 0; i < preload.tasks.length; i++){
				addTask(preload.tasks[i])
			};
		};

		toggle = new Toggle();
		label = new Label(category);

		controls.append(
			toggle.getElement(),
			label.getElement()
		);

		//	add components
		taskLineElement.append(timeline, controls);


		/**
		* @param {object} [preload]
		**/
		function addTask(preload){
			var task;

			//	make new Task with backbone
			task = new Task({
				taskGroup: publicInterface
			});


			tasks.push(task);


			//	TODO
			//	make task draggable
			//taskElement.draggable();

			/*taskElement.click(function(e){
				e.stopPropagation();
				
				//	create a new view to modify task
				new TaskModifierView({ task: task });
			});*/

			//	move this task line to the top of the graph
			shiftTaskLineToTop();
		};

		function shiftTaskLineToTop(){
			taskLineElement.fadeOut(function(){
				taskLineElement.parent().prepend(taskLineElement);
				taskLineElement.fadeIn();
			});
		};

		function deleteTask(t){
			console.log('deleteing task', t);

			for(var i = 0; i < tasks.length; i++){
				if(tasks[i] === t){
					tasks[i].getElement().remove();
					tasks.splice(i, 1);
					return;
				};
			};
		};

		function getElement(){
			return taskLineElement;
		};

		function save(){

			//	record category
			category = label.getLabel();

			//	assign category to each task
			for(var i = 0; i < tasks.length; i++){
				tasks[i].set({ category: category });
			};
		};

		function scale(start, timeSpan){
			timelineWidth = timeline.width();

			for(var i = 0; i < tasks.length; i++){
				tasks[i].scale(start, timeSpan, timelineWidth);
			};
		};

		function getCategory(){
			return category;
		};

		function getTasks(){
			var taskSummaries = [];

			for(var i = 0; i < tasks.length; i++){
				taskSummaries.push(tasks[i].getSummary());
			};

			return taskSummaries;
		};

		/*********************************
				constructors
		*********************************/

		function TaskModifier(task){
			var view = new TaskModifierView({
				task: task
			});
		};

		/**
		* @param {string} [category='label']
		**/
		function Label(category){

			var labelElement,
				label = category || 'label';

			labelElement = $('<div>')
				.addClass('label')
				.click(function(){

					var input,
						oldLabel;

					oldLabel = $(this).text();

					$(this).empty();

					input = $('<input>')
						.val(oldLabel)
						.click(function(e){
							e.stopPropagation();
						})

						.blur(function(){

							var newVal = $.trim($(this).val());

							$(this).remove();

							if(newVal !== ''){
								setLabel(newVal);
							} else {
								setLabel(oldLabel);
							};
						});

					input
						.appendTo(labelElement)
						.focus();
				});

			//	set initial label
			setLabel(label);

			function setLabel(newLabel){
				label = newLabel;
				labelElement.text(label);
			};

			function getLabel(){
				return label;
			};

			function getElement(){
				return labelElement;
			};

			return {
				setLabel: setLabel,
				getLabel: getLabel,
				getElement: getElement
			};
		};

		function Toggle(){

			var toggleElement,
				playing = true;

			/*
			toggleElement = $('<div>')
				.addClass('toggle pause')
				.text('pause')
				.click(toggle);
			*/
			toggleElement = $('<div>')
				.addClass('ui-state-default ui-corner-all toggle')
				.append(
					$('<span>')
						.addClass('ui-icon ui-icon-pause')
				)
				.hover(
					function() {
						$( this ).addClass( "ui-state-hover" );
					},
					function() {
						$( this ).removeClass( "ui-state-hover" );
					}
				)
				.click(toggle);

			//<li class="ui-state-default ui-corner-all" title=".ui-icon-play"><span class="ui-icon ui-icon-play"></span></li>


			function toggle(){

				var newestTask = tasks[tasks.length - 1];

				$('span', toggleElement).toggleClass('ui-icon-pause ui-icon-play');

				if(newestTask && newestTask.get('end') === undefined){
					newestTask.setEnd();
				} else {
					//	create a new task (to the user, this looks like resuming)
					addTask();
				};

				playing = !playing;
			};

			function getElement(){
				return toggleElement;
			};	

			return {
				getElement: getElement
			};
		};

		/*********************************
				public interface
		*********************************/

		return publicInterface;
	};


	/**
	* @param {object} preload
	**/
	// function Task(taskGroup, preload){
	// 	var taskGroup = taskGroup,
	// 		start,
	// 		end,
	// 		duration,
	// 		taskElement,
	// 		category,
	// 		instance = this;

	// 	//	initialize
	// 	if(preload){
	// 		start = Number(preload.start);
	// 		end = preload.end === 0 ? undefined : Number(preload.end);
	// 		duration = preload.duration === 0 ? undefined : Number(preload.duration);
	// 		category = preload.category;
	// 	} else {
	// 		start = new Date().getTime();
	// 	};

	// 	taskElement = $('<div>')
	// 		.addClass('task')
	// 		.css('background-color', getColor());

	// 	function getColor(){
	// 		return 'rgba(' + util.rand(0, 255) + ', ' + util.rand(0, 255) + ', ' +  util.rand(0, 255) + ', .5)';
	// 	};

	// 	/**
	// 	* @param {number, Date} time
	// 	* @return {boolean} success
	// 	**/
	// 	function setStart(time){

	// 		var time = time;

	// 		if(typeof time === 'object'){
	// 			time = time.getTime();
	// 		};

	// 		if(time ===  undefined){
	// 			start = Date.now();

	// 		} else  {
	// 			start = time;
	// 		};
	// 	};

	// 	/**
	// 	* @param {number, Date} time
	// 	* @return {boolean} success
	// 	**/
	// 	function setEnd(time){

	// 		var time = time || new Date();

	// 		//	convert time if needed
	// 		if(typeof time === 'object'){
	// 			time = time.getTime();
	// 		};
			
	// 		if(time > start){
	// 			end = time;
				
	// 			//	record duration
	// 			duration = Math.round((end - start) / 1000);

	// 			return true;
	// 		};

	// 		return false;
	// 	};

	// 	function getEnd(){
	// 		return end;
	// 	};

	// 	function getSummary(){

	// 		return {
	// 			start: start,
	// 			end: end,
	// 			duration: duration,
	// 			category: category
	// 		};
	// 	};

	// 	function getElement(){
	// 		return taskElement;
	// 	};

	// 	function scale(graphStart, timeSpan, timelinePixels){
			
	// 		var left = (start - graphStart) / timeSpan * timelinePixels,
	// 			width = end ? (end - start) / timeSpan * timelinePixels : timelinePixels - left;
			
	// 		taskElement.css({
	// 			left: left + 'px',
	// 			width: width + 'px'
	// 		});


	// 			//	identify left border & width

	// 		//	position
	// 	};

	// 	function setCategory(c){
	// 		category = c;
	// 	};

	// 	function destroy(){
	// 		console.log('destroying task', this);
	// 		taskGroup.deleteTask(this);
	// 	};

	// 	/*********************************
	// 			public interface
	// 	*********************************/
	// 	return {
	// 		getElement: getElement,
	// 		getSummary: getSummary,
	// 		setStart: setStart,
	// 		getEnd: getEnd,
	// 		setEnd: setEnd,
	// 		scale: scale,
	// 		setCategory: setCategory,
	// 		destroy: destroy
	// 	};
	// };

	/**
	* Used to abstract saving from where data is actually saved.  Provides a single interface for saving to localStorage or db.
	* @param {string} location 'localStorage' is the only supported value so far
	* @param {number} userID
	**/
	function HistoryProxy(location, userID){

		var location = location,
			userID = userID;

		/**
		* returns an array of categories from history
		**/
		function getCategories(){
			if(location === 'localStorage'){
				return getCategoriesLocal();
			};
		};

		function setCategories(c){
			if(location === 'localStorage'){
				setCategoriesLocal(c);
			};
		}

		/**
		* @param {Date} [start]
		* @param {Date} [end]
		**/
		function getTasks(start, end){
			if(location === 'localStorage'){
				return getTasksLocal(start, end);
			};
		};

		function getCategoriesLocal(){
			
			var categories = localStorage.categories;

			//	convert from JSON or create a new array
			if(categories !== undefined){
				categories = JSON.parse(categories);
			} else {
				categories = [];
			};

			return categories;
		};

		function setCategoriesLocal(c){
			localStorage.categories = JSON.stringify(c);
		};

		/**
		* @param {Date} [start]
		* @param {Date} [end]
		* @return {array}
		**/
		function getTasksLocal(start, end){
			
			var tasks = localStorage.tasks;

			//	convert from JSON or create a new array
			if(tasks !== undefined){
				tasks = JSON.parse(tasks);
			} else {
				tasks = [];
			};

			//	remove any tasks that start before specified start
			if(start){
				
				//	convert to ms for faster comparison
				start = start.getTime();

				//	tasks are stored in order, so we just need to find the first one that qualifies
				for(var i = 0; i < tasks.length; i++){
					if(tasks[i].start >= start){
						tasks = tasks.splice(i);
						break;
					};
				};
			};

			//	remove any that start after end
			if(end){

				//	convert for faster comparison
				end = end.getTime();

				//	splice off those out of bounds
				for(var i = 0; i < tasks.length; i++){
					if(tasks[i].start >= end){
						tasks.splice(i);
					};
				};
			};
			
			return tasks;
		};

		function setTasksLocal(t){

			//	sort by start
			t.sort(function(a, b){
				return a.start - b.start;
			});

			//	dedupe tasks
			for(var i = 0; i < t.length - 1; i++){
				if(t[i].start === t[i + 1].start){
					t.splice(i, 1);
				};
			};

			localStorage.tasks = JSON.stringify(t);
		};

		//	merge these categories with previously saved so we have a unique list
		function saveCategories(newCategories){
			var oldCategories = getCategories(),
				categories = [];

			//	combine oldCategories and categoriesUsed
			oldCategories = oldCategories.concat(newCategories);

			//	filter to only unique
			for(var i = 0; i < oldCategories.length; i++){
				if(categories.indexOf(oldCategories[i]) === -1){
					categories.push(oldCategories[i]);
				};
			};

			// save combined list
			setCategories(categories);
		};


		/**
		* @param {array} newTasks
		* @param {number} userID
		* @param {number} start beginning of timeframe for this Graph
		**/
		function saveTasks(newTasks, userID, start){

			console.log('saving @ ' + new Date());
			console.log(newTasks);

			var saveUrl = 'php/save.php',
				tasksJSON = JSON.stringify(newTasks);

			$.post(saveUrl, {
				tasks: newTasks,
				timeframe: {
					start: start,
					end: Date.now(),
					userID: userID
				}
			}, function(resp){

				var response = JSON.parse(resp);
				console.log(response);
				if(response.status){
					console.log('saved successfully');
					console.log(response.message);
				} else {
					console.error('error saving');
					console.log(response.message);
				}
			});
		};


		/**
		* Load saved tasks.
		* @param {number} start
		* @param {number} end
		* @param {function} callback passed array of tasks loaded
		**/
		function load(start, end, callback){

			var loadUrl = 'php/load.php';

			var resp = '{"status":true,"message":"tasks loaded: 3","data":[{"start":"1356530644285","end":"1356530652084","duration":"8","category":"label a"},{"start":"1356530645363","end":"1356530652795","duration":"7","category":"label b"},{"start":"1356530645963","end":"1356530653524","duration":"8","category":"label c"}]}';

			console.warn('this is fake response data');

			var response = JSON.parse(resp);
			if(response.status){
				console.log('loaded successfully');
				console.log(response.message);
				console.log(response.data);
				callback(response.data);
			} else {
				console.log('error loading');
				console.log(response.message);
			};

			/*$.post(loadUrl, {
				timeframe: {
					start: start,
					end: Date.now(),
					userID: userID
				}
			}, function(resp){
				
				var response = JSON.parse(resp);
				if(response.status){
					console.log('loaded successfully');
					console.log(response.message);
					console.log(response.data);
					callback(response.data);
				} else {
					console.log('error loading');
					console.log(response.message);
				};
			});*/
		};

		/**
		* @param {Date} [start]
		* @param {Date} [end]
		**/
		function getTasksFromHistory(start, end){
			return getTasks(start, end);
		};

		return {
			saveCategories: saveCategories,
			saveTasks: saveTasks,
			load: load,
			getTasks: getTasksFromHistory
		};
	};

	//=================================================================
	//	models

	var Task = Backbone.Model.extend({

		defaults: {

		},
		
		/**
		* @param {object} [preload] data for this Task to use
		**/
		//	TODO should we pass this variable here or is it used with this.get()?
		initialize: function(preload){

			var preload = preload;
			
			//	initialize
			console.log('resume here - preload needs to have the model data');
			if(preload){

				this.set({
					start: Number( preload.start ),
					end: preload.end === 0 ? undefined : Number(preload.end),
					duration: preload.duration === 0 ? undefined : Number(preload.duration),
					category: preload.category
				});
			} else {
				this.set({
					start: new Date().getTime()
				});
			};

			//	create an associated view instance
			this.set({
				view: new TaskView({
					taskGroup: this.attributes.taskGroup,
					taskModel: this
				})
			});
		},


		scale: function(start, timeSpan, timelineWidth){

			//	TODO this seems like too much to pass to the function
			//	Can we eliminate any of this?
			this.get('view').scale(start, timeSpan, timelineWidth, this.get('start'), this.get('end'));
		},

		/**
		* @return {object}
		**/
		getSummary: function(){

			//	TODO There is probably a better way to do this rather than calling get() over and over.
			//	Why do we use get()?
			return {
				start: this.get('start'),
				end: this.get('end'),
				duration: this.get('duration'),
				category: this.get('category')
			};
		},

		/**
		* @param {Date} [time] defaults to current time
		* @return {boolean}
		**/
		setEnd: function(time){

			var time = time || new Date(),
				start = this.get('start'),
				end;

			//	convert time if needed
			if(typeof time === 'object'){
				time = time.getTime();
			};

			//	update attributes			
			if(time > start){
				end = time;
				
				this.set({
					duration: Math.round((end - start) / 1000),
					end: time
				});

				return true;
			};

			return false;
		},

		/**
		* @param {number, Date} time
		* @return {boolean} success
		**/
		setStart: function(time){

			var time = time;

			if(typeof time === 'object'){
				time = time.getTime();
			};

			if(time ===  undefined){
				this.set('start', Date.now());

			} else  {
				this.set('start', time);
			};
		}
	});

	//=================================================================
	//	views
	var TaskModifierView = Backbone.View.extend({

		initialize: function(){
			this.render();
		},

		render: function(){

			//	compile template
			var template = _.template( $('#taskModifier_template').html() );

			//	load compiled template
			this.$el.html( template );

			//	attach to DOM
			this.options.task.$el.append(this.$el);

			//	make button pretty
			this.$el.find('input[type="submit"]').button();

			//	prepopulate with current values from Task
			prepopulate(this.options.task);

			//	focus on first field
			this.$el.find('input').first().focus();
			
			function prepopulate(task){
				var taskSummary = task.options.taskModel.getSummary(),
					start = taskSummary.start,
					end;

				if(taskSummary.duration){
					end = start + taskSummary.duration * 1000;
					end = util.getFriendlyTimeStamp(end);
				};

				start = util.getFriendlyTimeStamp(start);

				$('#start', this.$el).val(start);
				$('#end', this.$el).val(end);

				//	disable end for now if not already stopped to prevent TaskGroup toggle issue
				if(end === undefined){
					$('#end', this.$el).attr('disabled', 'disabled');
				};
			};
		},

		events: {
			'click form#timeAdjuster': 'clickForm',
			'submit form#timeAdjuster': 'submitForm',
			'click a.delete': 'deleteTask'
		},

		//	prevent bubbling so additional forms are not added
		clickForm: function(e){
			e.stopPropagation();
		},

		//	submit new times to change Task
		submitForm: function(){
			
			var start = $('#start', this.$el).val(),
				end = $('#end', this.$el).val(),
				task = this.options.task.options.taskModel;

			if(validateForm()){
				if(start) {
					task.setStart(start);
				};

				if(end){
					task.setEnd(end);
				};

				//	remove view from DOM
				this.remove();
			};
			
			return false;

			function validateForm(){

				//	TODO don't change the values during validation
				if(start) {
					start = util.convertUserInputToDate(start);
				};

				if(end){
					end = util.convertUserInputToDate(end);
				};

				if(end){
					return start < end;
				} else {
					//	TODO handle overlapping Tasks
					return true;
				};
			};
		},

		//	delete this task
		deleteTask: function(){
			console.log('delete task', this.options.task);
			this.options.task.destroy();
		}
	});

	var TaskView = Backbone.View.extend({

		initialize: function(){
			this.render();
		},

		render: function(){

			//	compile template
			var template = _.template( $('#task_template').html() );

			//	load compiled template
			this.$el.html( template );

			this.$el
				.css('background-color', getColor())
				.addClass('task');

			//	attach to DOM
			this.$el.appendTo( this.options.taskGroup.getElement() );

			function getColor(){
				return 'rgba(' + util.rand(0, 255) + ', ' + util.rand(0, 255) + ', ' +  util.rand(0, 255) + ', .5)';
			};
		},

		scale: function(graphStart, timeSpan, timelinePixels, start, end){

			var left = (start - graphStart) / timeSpan * timelinePixels,
				width = end ? (end - start) / timeSpan * timelinePixels : timelinePixels - left;
			
			this.$el.css({
				left: left + 'px',
				width: width + 'px'
			});
		},

		events: {
			'click': 'clickTask'
		},

		clickTask: function(){
			console.log('yo', this);

			//	create a new view to modify task
			new TaskModifierView({ task: this });
		}
	});

	return {
		Graph: Graph
	};
});