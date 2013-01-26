/**
* module used to display tasks while recording or as a summary
* @module graph
**/

define(['util',
		'labels'], 
function(util, 
		labelsModule){

	/**
	* manages controls for graph, triggers save/refresh, 
	* can by used to display saved tasks currently (Does this make sense?)
	* @class Graph
	* @constructor
	* @param {jq} element the container for the Graph
	**/
	function Graph(element){

		var 
			/**
			* container for the Graph
			* @property taskGraphElement
			* @type jq
			* @private
			**/
			taskGraphElement = element,

			/**
			* button to create new tasks
			* @property newTaskButton
			* @type jq
			* @private
			**/
			newTaskButton,
			
			/**
			* wrapper for controls
			* @property controls
			* @type jq
			* @private
			**/
			controls,
			
			/**
			* collection of each line/group of tasks
			* @property taskLines
			* @type array
			* @private
			**/
			taskLines = [],

			/**
			* milliseconds indicating start of Graph 
			* @property startTime
			* @type number
			* @private
			**/
			startTime = Date.now(),
			
			/**
			* milliseconds indicating end of Graph 
			* @property endTime
			* @type number
			* @private
			**/
			endTime,
			
			/**
			* refresh interval control
			* @property refreshSlider
			* @type jq
			* @private
			**/
			refreshSlider = $('#refresh-interval'),

			/**
			* save interval control
			* @property saveSlider
			* @type jq
			* @private
			**/			
			saveSlider = $('#save-interval'),

			/**
			* refresh interval in milliseconds
			* @property refreshInterval
			* @type number
			* @default 100
			* @private
			**/						
			refreshInterval = 100,

			/**
			* save interval in milliseconds
			* @property saveInterval
			* @type number
			* @default 30000
			* @private
			**/			
			saveInterval = 30000,

			/**
			* handle for refresh timeout
			* @property refreshTimeoutHandle
			* @type number
			* @private
			**/
			refreshTimeoutHandle,

			/**
			* handle for save timeout
			* @property saveTimeoutHandle
			* @type number
			* @private
			**/
			saveTimeoutHandle,

			/**
			* user id
			* @property userID
			* @type number
			* @default 0
			* @private
			**/			
			userID = userID || 0,

			/**
			* task manager
			* @property taskManager
			* @type TaskGroupManager
			* @private
			**/
			taskManager = new TaskGroupManager(userID),
			
			/**
			* history interface
			* @property history
			* @type HistoryProxy
			* @private
			**/
			history = new util.HistoryProxy(userID);

		//	Are there any tasks in progress?
		console.log('unsaved: ', history.getActiveTasks());

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
		* @method adjustGraph
		* @param {booelan} [recurring=true] If set, will schedule another adjustGraph automatically.
		* @private
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

			taskManager.scaleTaskGroups(timeSpan);

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
		* create a new line/group of tasks
		* @method addTaskGroup
		* @param {object} [tasks] if provided, loads these tasks into the group
		* @param {string} [tasks.category]
		* @param {array} [tasks.tasks]
		* @private
		**/
		function addTaskGroup(tasks){
			taskManager.addTaskGroup();
		};


		/**
		* clears save interval, saves, sets up new interval
		* @method save
		* @private
		**/
		function save(){
			//	clear out pending saves
			clearTimeout(saveTimeoutHandle);

			//	save
			taskManager.save(startTime);

			//	set up next save
			saveTimeoutHandle = setTimeout(save, $('#save-interval').slider('option', 'value') * 1000);
		};


		/**
		* fetch any unfinished tasks from the database
		* @method getUnfinishedTasks
		* @private
		**/
		function getUnfinishedTasks(){
			var TEST_DATA = '[{"start":"1355013825120","end":"0","duration":"0","category":"label"},{"start":"1355014091368","end":"0","duration":"0","category":"label"},{"start":"1355014223771","end":"0","duration":"0","category":"label"},{"start":"1355014234419","end":"0","duration":"0","category":"label"},{"start":"1355014235435","end":"0","duration":"0","category":"label"},{"start":"1355014236091","end":"0","duration":"0","category":"label"},{"start":"1355014237835","end":"0","duration":"0","category":"label"},{"start":"1355014238330","end":"0","duration":"0","category":"label"},{"start":"1355014238915","end":"0","duration":"0","category":"label"},{"start":"1355014239451","end":"0","duration":"0","category":"label"},{"start":"1355014239986","end":"0","duration":"0","category":"label"},{"start":"1355014242806","end":"0","duration":"0","category":"label"},{"start":"1355014243349","end":"0","duration":"0","category":"label"},{"start":"1355014243742","end":"0","duration":"0","category":"label"},{"start":"1355014245371","end":"0","duration":"0","category":"label"},{"start":"1355014245574","end":"0","duration":"0","category":"label"},{"start":"1355014245810","end":"0","duration":"0","category":"label"},{"start":"1355014246033","end":"0","duration":"0","category":"label"},{"start":"1355014246250","end":"0","duration":"0","category":"label"},{"start":"1355014246490","end":"0","duration":"0","category":"label"},{"start":"1355014443636","end":"0","duration":"0","category":"label"},{"start":"1355019546976","end":"0","duration":"0","category":"label"},{"start":"1355019548122","end":"0","duration":"0","category":"label"},{"start":"1355019549379","end":"0","duration":"0","category":"label"},{"start":"1355019563023","end":"0","duration":"0","category":"label"},{"start":"1355019563693","end":"0","duration":"0","category":"label"},{"start":"1355019627286","end":"0","duration":"0","category":"label"},{"start":"1355019628189","end":"0","duration":"0","category":"label"},{"start":"1355019629611","end":"0","duration":"0","category":"label"},{"start":"1355019630831","end":"0","duration":"0","category":"label"},{"start":"1355019631913","end":"0","duration":"0","category":"label"},{"start":"1355019632913","end":"0","duration":"0","category":"label"},{"start":"1355019633924","end":"0","duration":"0","category":"label"},{"start":"1355019634375","end":"0","duration":"0","category":"label"},{"start":"1355019635029","end":"0","duration":"0","category":"label"},{"start":"1355019637127","end":"0","duration":"0","category":"label"},{"start":"1355019704141","end":"0","duration":"0","category":"label"},{"start":"1355082904315","end":"0","duration":"0","category":"label"},{"start":"1355082904983","end":"0","duration":"0","category":"label"},{"start":"1355082905154","end":"0","duration":"0","category":"label"},{"start":"1355085198467","end":"0","duration":"0","category":"label a"},{"start":"1355085434159","end":"0","duration":"0","category":"label"},{"start":"1355086293323","end":"0","duration":"0","category":"label"},{"start":"1355086293481","end":"0","duration":"0","category":"label"},{"start":"1355086293649","end":"0","duration":"0","category":"label"},{"start":"1355086293819","end":"0","duration":"0","category":"label"},{"start":"1355103937095","end":"0","duration":"0","category":"label"},{"start":"1355104022003","end":"0","duration":"0","category":"label"},{"start":"1355104036109","end":"0","duration":"0","category":"label"},{"start":"1355104036277","end":"0","duration":"0","category":"label"},{"start":"1355104111000","end":"0","duration":"0","category":"label"},{"start":"1355104112496","end":"0","duration":"0","category":"label"},{"start":"1355104154759","end":"0","duration":"0","category":"label"},{"start":"1355104369905","end":"0","duration":"0","category":"label"},{"start":"1355104372380","end":"0","duration":"0","category":"label"},{"start":"1355104372665","end":"0","duration":"0","category":"label"},{"start":"1355104461207","end":"0","duration":"0","category":"label"},{"start":"1355104467883","end":"0","duration":"0","category":"label"},{"start":"1355104468000","end":"0","duration":"0","category":"label"},{"start":"1355104530690","end":"0","duration":"0","category":"label"},{"start":"1355104550443","end":"0","duration":"0","category":"label"},{"start":"1355104552245","end":"0","duration":"0","category":"label"},{"start":"1355104649808","end":"0","duration":"0","category":"label"},{"start":"1355104652431","end":"0","duration":"0","category":"label"},{"start":"1355104652843","end":"0","duration":"0","category":"label"},{"start":"1355104655233","end":"0","duration":"0","category":"label"},{"start":"1355104655403","end":"0","duration":"0","category":"label"},{"start":"1355104661257","end":"0","duration":"0","category":"label"},{"start":"1355104661422","end":"0","duration":"0","category":"label"},{"start":"1355105436611","end":"0","duration":"0","category":"label"},{"start":"1355105437207","end":"0","duration":"0","category":"label"},{"start":"1355105438286","end":"0","duration":"0","category":"label"},{"start":"1355105438440","end":"0","duration":"0","category":"label"},{"start":"1355105784587","end":"0","duration":"0","category":"label"},{"start":"1355105840883","end":"0","duration":"0","category":"label"},{"start":"1355105938634","end":"0","duration":"0","category":"label"},{"start":"1355105940433","end":"0","duration":"0","category":"label"},{"start":"1355105942342","end":"0","duration":"0","category":"label"},{"start":"1355105944458","end":"0","duration":"0","category":"label"},{"start":"1355106632163","end":"0","duration":"0","category":"label"},{"start":"1355106633613","end":"0","duration":"0","category":"label"},{"start":"1355229922157","end":"0","duration":"0","category":"migrate site"},{"start":"1355319964848","end":"0","duration":"0","category":"email"},{"start":"1355782778610","end":"0","duration":"0","category":"email"},{"start":"1356359597068","end":"0","duration":"0","category":"label"},{"start":"1356561285354","end":"0","duration":"0","category":"Claudio - chat"},{"start":"1356618600000","end":"0","duration":"0","category":"organize issues"},{"start":"1356618600000","end":"0","duration":"0","category":"organize issues"},{"start":"1356732117760","end":"0","duration":"0","category":"bug 129893"},{"start":"1357742745982","end":"0","duration":"0","category":"smoke"},{"start":"1357826795770","end":"0","duration":"0","category":"a"},{"start":"1358345048997","end":"0","duration":"0","category":"label"},{"start":"1358345049772","end":"0","duration":"0","category":"label"},{"start":"1358345050188","end":"0","duration":"0","category":"label"},{"start":"1358345114415","end":"0","duration":"0","category":"label"},{"start":"1358345114589","end":"0","duration":"0","category":"label"},{"start":"1358345115421","end":"0","duration":"0","category":"label"},{"start":"1358345126109","end":"0","duration":"0","category":"label"},{"start":"1358345126317","end":"0","duration":"0","category":"label"},{"start":"1358345126525","end":"0","duration":"0","category":"label"},{"start":"1358345126804","end":"0","duration":"0","category":"label"}]';

			util.ajax('php/load-running.php', {
				timeframe: {
					userID: 0
				}
			}, function(success, resp){

				var response;

				if(success){
					response = JSON.parse(resp);
					
					if(response.status){
						console.log(response.data);
					} else {

						//	TODO remove the TEST_DATA reference
						console.error(response.message);

						response = JSON.parse(TEST_DATA);
						console.warn('using test data', response);
					};

					//	get start of first, this is lowest since the query is ordered by start
					if(response && response.length > 0){
						changeStart(new Date(parseInt(response[0].start, 10)));
					};
				} else {
					console.error('unable to fetch unfinished tasks');
				};
			});
		};

		/*********************************
				public interface
		*********************************/
		
		/**
		* Start using this graph to record new events.
		* @method record
		**/
		function record(){

			getUnfinishedTasks();

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
		* @method load
		* @param {number} start
		* @param {number} end
		**/
		function load(start, end){

			startTime = start;
			endTime = end;

			taskManager.load(start, end, function(tasks){

				var categories = [];

				//	replace old info with info from loaded tasks
				taskManager = new TaskGroupManager(userID)

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


		/**
		* change start time of graph
		* @method changeStart
		* @param {Date} start
		**/
		function changeStart(start){
			console.log('change graph start to: ' + start);
			startTime = start.getTime();
		};

		return {
			record: record,
			load: load,
			changeStart: changeStart
		};
	};


	/**
	* manages all the lines/groups of tasks
	* @class TaskGroupManager
	* @constructor
	* @param {number} userID
	**/
	function TaskGroupManager(userID){
		
		var 
			/**
			* lines/groups of tasks managed by this TaskGroupManager
			* @property taskGroups
			* @type array
			* @private
			**/ 
			taskGroups = [],

			/**
			* history proxy used to save/load tasks
			* @property history
			* @type HistoryProxy
			* @private
			**/
			history = new util.HistoryProxy(userID);	

		/**
		* save tasks on graph since a specified start time
		* @method save
		* @param {number} start beginning of this TimeGraph
		**/
		function save(start){

			var categoriesUsed = [],
				category,
				tasksUsed = [],
				start = start;
			
			//	capture current organization of Tasks and TaskGroups
			for(var i = 0; i < taskGroups.length; i++){
				
				taskGroups[i].saveTaskGroup();

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
		* @method load
		* @param {number} start
		* @param {number} end
		* @param {function} callback passed array of tasks
		**/
		function load(start, end, callback){

			history.load(start, end, function(tasks){
				callback(tasks);
			});
		};


		/**
		* get an array of tasks via the util.HistoryProxy
		* @method getSummary
		* @param start
		* @param end
		* @return {array}
		**/
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

		
		/**
		* Create a new TaskGroupModel & TaskGroupView
		* @method addTaskGroup
		**/
		function addTaskGroup(){
			
			var taskGroupModel = new TaskGroupModel(),
				taskGroupView = new TaskGroupView({
				model: taskGroupModel
			});

			taskGroups.push(taskGroupModel);
		};


		/**
		* trigger each TaskGroup to rescale
		* @method scaleTaskGroups
		* @param {number} timeSpan
		**/
		function scaleTaskGroups(timeSpan){
			for(var i = 0; i < taskGroups.length; i++){
				taskGroups[i].set({timeSpan: timeSpan});
			};
		};

		return {
			addTaskGroup: addTaskGroup,
			save: save,
			load: load,
			getSummary: getSummary,
			scaleTaskGroups: scaleTaskGroups
		}
	};


	/**
	* group/line of tasks, used to manage starting/stopping instances of a task category/label
	* contains charted portion and controls (start/stop & label)
	* @class TaskGroup
	* @constructor
	* @param {object} [preload] I don't think these work anymore... if provided, loads these tasks into the group
	* 	@param {string} [preload.category]
	* 	@param {array} 	[preload.tasks]
	**/
	function TaskGroup(preload){

		var 
			/**
			* returned from this constructor, for some weird reason I don't remember, it's 
			* passed to new tasks
			* @property publicInterface
			* @type object
			* @private
			**/
			publicInterface = {},

			/**
			* container for this TaskGroup
			* @property taskLineElement
			* @type jq
			* @private
			**/
			taskLineElement,

			/**
			* container for the portion of this TaskGroup that shows the tasks
			* @property timeline
			* @type jq
			* @private
			**/
			timeline,

			/**
			* container for controls (pause button, label)
			* @property controls
			* @type jq
			* @private
			**/
			controls,

			/**
			* toggle control
			* @property toggle
			* @type Toggle
			* @private
			**/
			toggle,

			/**
			* label control
			* @property label
			* @type Label
			* @private
			**/
			label,

			/**
			* category/label for this TaskGroup and its tasks
			* @property category
			* @type string
			* @private
			**/
			category = ( preload !== undefined ) ? preload.category : undefined,

			/**
			* collection of tasks within this TaskGroup
			* @property tasks
			* @type array
			* @private
			**/
			tasks = [],

			/**
			* history proxy for saving tasks on this TaskGroup
			* @property history
			* @type HistoryProxy
			* @private
			**/
			history = new util.HistoryProxy(0);

		taskLineElement = $('<div>').addClass('taskLine ui-corner-all ui-widget-content');

		timeline = $('<div>').addClass('timeline');
		controls = $('<div>').addClass('controls');

		toggle = new Toggle();
		label = new Label(category);


		//	This has to be defined above the first addTask().
		//	This is crazy.  Refactor this crap.
		publicInterface = {
			getElement: getElement,
			getCategory: getCategory,
			getTasks: getTasks,
			scale: scale,
			saveTaskGroup: save,
			deleteTask: deleteTask,
			addTask: addTask
		};

		//	initialize
		if(preload === undefined){
			addTask();
		} else {
			for(var i = 0; i < preload.tasks.length; i++){
				addTask(preload.tasks[i])
			};
		};

		controls.append(
			toggle.getElement(),
			label.getElement()
		);

		//	add components
		taskLineElement.append(timeline, controls);


		/**
		* add a new task to this TaskGroup
		* @method addTask
		* @param {object} [preload]
		**/
		function addTask(preload){
			var task;

			
			return;
			//	make new Task with backbone
			task = new Task({
				taskGroup: publicInterface,
				preload: preload
			});


			tasks.push(task);

			//	move this task line to the top of the graph
			shiftTaskLineToTop();

			//	save task locally
			history.storeLocal(task.get('start'), task.get('end'), label.getLabel());
		};


		/**
		* shift this TaskGroup to the top of the Graph
		* @method shiftTaskLineToTop
		* @private
		**/
		function shiftTaskLineToTop(){
			taskLineElement.fadeOut(function(){
				taskLineElement.parent().prepend(taskLineElement);
				taskLineElement.fadeIn();
			});
		};


		/**
		* delete a task from this TaskGroup
		* @method deleteTask
		* @param t
		**/
		function deleteTask(t){
			for(var i = 0; i < tasks.length; i++){
				if(tasks[i] === t){
					tasks.splice(i, 1);
					return;
				};
			};
		};


		/**
		* get the container for this TaskGroup (taskLineElement)
		* @method getElement
		* @return {jq}
		**/
		function getElement(){
			return taskLineElement;
		};


		/**
		* appears to just assign the category to each task
		* @method save
		**/
		function save(){

			//	record category
			category = label.getLabel();

			//	assign category to each task
			for(var i = 0; i < tasks.length; i++){
				tasks[i].set({ category: category });
			};
		};


		/**
		* rescale the dimensions of each task in this TaskGroup
		* @method scale
		* @param start
		* @param timeSpan
		**/
		function scale(start, timeSpan){
			var timelineWidth = timeline.width();

			for(var i = 0; i < tasks.length; i++){
				tasks[i].scale(start, timeSpan, timelineWidth);
			};
		};


		/**
		* getter for category
		* @method getCategory
		* @return {string}
		**/
		function getCategory(){
			return category;
		};


		/**
		* get an array of summaries for each task
		* @method getTasks
		* @return {array}
		**/
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

		/**
		* Backbone view to modify task -
		* This is not the best way to do this.
		* @class TaskModifier
		* @constructor
		* @param {Task} task
		**/
		function TaskModifier(task){
			var view = new TaskModifierView({
				task: task
			});
		};


		/**
		* used to set the category for the TaskGroup
		* @class Label
		* @constructor
		* @param {string} [category='label']
		**/
		function Label(category){

			var 
				/**
				* @property labelElement
				* @type jq
				* @private
				**/ 
				labelElement,

				/**
				* @property label
				* @type string
				* @default 'label'
				* @private
				**/
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

						.focus(function(){
							$(this).autocomplete({
								source: labelsModule.getLabels()
							});
						})

						.blur(function(){

							var newVal = $.trim($(this).val());

							$(this).autocomplete('destroy');

							$(this).remove();

							if(newVal !== ''){
								setLabel(newVal);
								labelsModule.addLabel(newVal);
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


			/**
			* setter for label
			* @method setLabel
			* @param {string} newLabel
			**/
			function setLabel(newLabel){
				label = newLabel;
				labelElement.text(label);
			};


			/**
			* getter for label
			* @method getLabel
			* @return string
			**/ 
			function getLabel(){
				return label;
			};

			
			/**
			* get the container element
			* @method getElement
			* @return jq
			**/
			function getElement(){
				return labelElement;
			};

			return {
				setLabel: setLabel,
				getLabel: getLabel,
				getElement: getElement
			};
		};


		/**
		* used to pause/resume tasks
		* @class Toggle
		* @constructor
		**/ 
		function Toggle(){

			var toggleElement,
				playing = true;

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


			/**
			* stop a running task or start a new one if none running
			* @method toggle
			* @private
			**/ 
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

			/**
			* @method getElement
			* @return jq
			**/
			function getElement(){
				return toggleElement;
			};	

			return {
				getElement: getElement
			};
		};

		return publicInterface;
	};


	//=================================================================
	//	models

	/**
	* Backbone Model
	* @class Task
	* @constructor
	**/
	var Task = Backbone.Model.extend({

		defaults: {
			width: 0,
			left: 0
		},
		
		/**
		* @param {object} [preload] data for this Task to use
		**/
		initialize: function(){

			var preload = preload;
			
			//	initialize
			//	TODO	preload needs to have the model data
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
					taskModel: this,
					model: this
				})
			});
		},


		/**
		* @method scale
		* @param graphStart
		* @param timeSpan
		* @param timelinePixels
		**/
		scale: function(graphStart, timeSpan, timelinePixels){

			//	TODO is this this best way to get/set within the model?

			var left = (this.attributes.start - graphStart) / timeSpan * timelinePixels,
				width = this.attributes.end ? (this.attributes.end - this.attributes.start) / 
					timeSpan * timelinePixels : timelinePixels - left,
				MIN_WIDTH = 20;

			//	account for minimum width
			width = Math.max(width, MIN_WIDTH);

			this.set({
				left: left,
				width: width
			});
		},


		/**
		* @method getSummary
		* @return {object}
		**/
		getSummary: function(){

			//	TODO There is probably a better way to do this rather than calling get() over and over.
			//	Why do we use get()?
			return {
				start: this.attributes.start,
				end: this.attributes.end,
				duration: this.get('duration'),
				category: this.get('category')
			};
		},

		/**
		* @method setEnd
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
		* @method setStart
		* @param {number, Date} time
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
		},

		/**
		* remove the view, delete the task from the TaskGroup
		* @method delete
		**/
		delete: function(){
			this.get('view').remove();
			this.attributes.taskGroup.deleteTask(this);
		}
	});

	/**
	* model to manage a group of similar tasks and stopping/starting instances
	* @class TaskGroupModel
	* @constructor
	**/
	var TaskGroupModel = Backbone.Model.extend({
		initialize: function(){

			this.tasks = [];
			this.timeSpan = 0;
			this.startTime = 0;
			this.on('change', this.handleChanges, this);
		},

		/**
		* listen for changes to this model and handle them accordingly - primarily used
		* to listen for changes to timespan
		* @method handleChanges
		* @param {TaskGroupModel} model
		* @param {object} info info about what changed
		**/
		handleChanges: function(model, info){
			if(info.changes.timeSpan){
				console.log(model.changed.timeSpan);
				this.scaleTasks(0, model.changed.timeSpan);
			};
		},

		/**
		* add a new task to this TaskGroupModel
		* @method addTask
		* @param {object} [preload]
		**/
		addTask: function(preload){
			var task;

			//	make new Task with backbone
			task = new Task({
				taskGroup: this
			});

			this.tasks.push(task);
			
			//	move this task line to the top of the graph
			//shiftTaskLineToTop();

			//	save task locally
			// history.storeLocal(task.get('start'), task.get('end'), label.getLabel());
		},

		/**
		* get the DOM element that contains the tasks this TaskGroupModel manages
		* @method getTaskContainer
		* @return {jq}
		**/
		getTaskContainer: function(){
			return this.attributes.view.$el.find('.timeline');
		},

		/**
		* rescale the dimensions of each task in this TaskGroup
		* @method scale
		* @param start
		* @param timeSpan
		**/
		scaleTasks: function(startTime, timeSpan){
			
			var timelineWidth = this.getTaskContainer().width();

			for(var i = 0; i < this.tasks.length; i++){
				this.tasks[i].scale(startTime, timeSpan, timelineWidth);
			};
		},

		/**
		* appears to just assign the category to each task
		* @method save
		**/
		saveTaskGroup: function(){

			//	record category
			this.category = this.label.getLabel();

			//	assign category to each task
			for(var i = 0; i < tasks.length; i++){
				tasks[i].set({ category: category });
			};
		}
	});


	var LabelModel = Backbone.Model.extend({
		defaults: {
			label: 'label'
		},
		initialize: function(){
			
		}
	});

	//=================================================================
	//	views

	var LabelView = Backbone.View.extend({
		initialize: function(){
			this.render();
		},
		render: function(){
		}
	});


	/**
	* Backbone View
	* @class TaskModifierView
	* @constructor
	**/
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
			this.options.taskModel.delete();
		}
	});

	var TaskView = Backbone.View.extend({

		initialize: function(){

			//	compile template
			var template = _.template( $('#task_template').html() );

			//	load compiled template
			this.$el.html( template );

			this.$el
				.css('background-color', getColor())
				.addClass('task');

			//	attach to DOM
			this.$el.appendTo( this.options.taskGroup.getTaskContainer() );

			this.model.on('change', this.render, this);

			this.render();

			function getColor(){
				return 'rgba(' + util.rand(0, 255) + ', ' + util.rand(0, 255) + ', ' +  util.rand(0, 255) + ', .5)';
			};
		},

		render: function(){
			var left = this.model.get('left'),
				width = this.model.get('width');


			this.$el.css({
				left: left + 'px',
				width: width + 'px'
			});
		},

		events: {
			'click': 'clickTask'
		},

		clickTask: function(){

			//	create a new view to modify task
			new TaskModifierView({
				task: this,
				taskModel: this.model
			});
		}
	});


	/**
	* line that contains all instances if a task
	* @class TaskGroupView
	* @constructor
	**/
	var TaskGroupView = Backbone.View.extend({
		//task_group_template
		initialize: function(){
			var template = _.template( $('#task_group_template').html() );
			this.$el.html( template );
			this.$el.prependTo('#graph');

			this.model.on('change', this.render, this);
		},
		render: function(){
			console.log('TaskGroupModel changed', this.model.get('timeSpan'));
		},
		events: {
			'click .toggle': 'toggleTask'
		},
		toggleTask: function(){
			console.log('toggled');
			console.log(this.model.tasks);
		}
	});

	return {
		Graph: Graph
	};
});