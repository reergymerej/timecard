function post(){

	var task = new TaskModel();

	task.save({}, {
		success: function(task){
			console.log('task created:', task.toJSON());
		}
	});
};

function get(id){
	
	var task = new TaskModel({id: id});

	task.fetch({
		success: function(task){
			console.log(task.toJSON());
		}
	});
};

function update(id, label){
	
	var task = new TaskModel({
		id: id
	});

	task.save({
		label:label
	}, {
		success: function(task){
			console.log(task.toJSON());
		}
	})
};

function del(id){
	var task = new TaskModel({id:id});
	task.destroy({
		success: function(){
			console.log('destroyed!');
		}
	});
};

var TaskModel = Backbone.Model.extend({
	urlRoot: 'php/api/Task',
	defaults: {
		label: undefined,
		start: Date.now()
	},
	initialize: function(){
		
	}
});

var TaskView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this, 'render');
		this.model.bind('change', this.render);

		var template = _.template( $('#task_view_template').html() );
		this.$el.html( template );
		$('#taskHolder').append( this.$el );
	},
	render: function(){
		this.$el.find('.id').html(this.model.get('id'));
	},
	events: {
		'click a': 'deleteTask'
	},
	deleteTask: function(){

		var thisView = this;

		this.model.destroy({
			success: function(){
				console.log('task destroyed');
				thisView.remove();
			}
		});
	}
});

var tasks = [];

$(function(){

	$('#new').click(function(){
		var task = new TaskModel();
		task.save();

		//	create view to go along with model
		new TaskView({model: task});

		tasks.push(task);
		console.log(tasks);
	});

});