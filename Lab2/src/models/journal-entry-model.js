const api = require('./api');

const dataFormattingRules = {
	Date: api.dateConvertor,						// Date
	"Did Attended": api.booleanConvertor,
	Student_ID: api.uuidConvertor,
	Class_ID: api.uuidConvertor
};

module.exports = {
	create: function({student_id, class_id, date, didAttend}){
		let config = paramValues;

		config["ID"] = 'uuid_generate_v4()';

		return api.create('public."Journal Entries"', config, dataFormattingRules)
		.then((res) => res.rows[0]);
	},
	update: function(id, properties){
		return api.update('public."Journal Entries"', properties, dataFormattingRules, {}, 'ID', id);
	},
	delete: function(id){
		return api.delete('public."Journal Entries"', 'ID', id);
	},
	get: function(id){
		return api.get('public."Journal Entries"', 'ID', id).then((res) => res.rows[0]);
	},
	list: function(filters){
		return api.list('public."Journal Entries"', 'ID', filters).then((res) => res.rows);
	},
	toString: () => "Journal entry",
	getProperties: () => ["Student_ID", "Class_ID", "Date", "Did Attended"],
	getPropertyTypes: () => ["uuid", "uuid", "date", "boolean"],
	getReferences: () => [
		{
			paramSource: "Student_ID",
			paramRef: "Student_ID",
			refTableName: "public.\"Students\""
		},
		{
			paramSource: "Class_ID",
			paramRef: "ID",
			refTableName: "public.\"TheClasses\""
		},
	],
};