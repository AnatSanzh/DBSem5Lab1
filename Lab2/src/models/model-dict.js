const classModel = require('./class-model.js');
const groupModel = require('./group-model.js');
const journalEntryModel = require('./journal-entry-model.js');
const studentModel = require('./student-model.js');
const teacherModel = require('./teacher-model.js');

module.exports={
	'public."TheClasses"': classModel,
	'public."Groups"': groupModel,
	'public."Journal Entries"': journalEntryModel,
	'public."Students"': studentModel,
	'public."Teachers"': teacherModel,
};