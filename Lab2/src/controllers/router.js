const Controller = require('./controller');

const menuView = require('../views/menu-view');
const ModelMenuGenerator = require('../views/model-menu-generator');
const modelView = require('../views/model-view');
const modelListView = require('../views/model-list-view');
const errorView = require('../views/error-view');

const classModel = require('../models/class-model');
const groupModel = require('../models/group-model');
const journalEntryModel = require('../models/journal-entry-model');
const studentModel = require('../models/student-model');
const teacherModel = require('../models/teacher-model');

const globalRouter = new Router();

const controllers = {
	'/' : new Controller(globalRouter, menuView),
	
	'/class' : new Controller(globalRouter, ModelMenuGenerator(classModel), classModel),
	'/group' : new Controller(globalRouter, ModelMenuGenerator(groupModel), groupModel),
	'/journal-entry' : new Controller(globalRouter, ModelMenuGenerator(journalEntryModel), journalEntryModel),
	'/student' : new Controller(globalRouter, ModelMenuGenerator(studentModel), studentModel),
	'/teacher' : new Controller(globalRouter, ModelMenuGenerator(teacherModel), teacherModel),
	
	'/view-single': new Controller(globalRouter, modelView),
	'/view-list': new Controller(globalRouter, modelListView),

	'/error' : new Controller(globalRouter, errorView),
};

function Router(){
	let navigationRequest =
	{
		path: '/',
		params: {}
	};


	this.begin = async function() {
		while(true){
			console.log('\033[2J\033[;H');

			await controllers[navigationRequest.path].display(navigationRequest.params);
		}
	};

	this.navigate = (path, params={}) => {
		navigationRequest={ path, params };
	};
}

module.exports = globalRouter;