const api = require('./api');

const dataFormattingRules = {
	Name: api.stringConvertor,			// string
	Time: api.numberConvertor,			// integer
	Location: api.pointConvertor,		// point
	"Teacher ID": api.uuidConvertor,	// uuid
	"Group ID": api.uuidConvertor		// uuid
};

module.exports = {
	create: function(paramValues){
		let config = paramValues;

		config["ID"] = 'uuid_generate_v4()';

		return api.create('public."TheClasses"', config, dataFormattingRules)
		.then((res) => res.rows[0]);
	},
	update: function(id, properties){
		return api.update('public."TheClasses"', properties, dataFormattingRules, {}, 'ID', id);
	},
	delete: function(id){
		return api.delete('public."TheClasses"', 'ID', id);
	},
	get: function(id){
		return api.get('public."TheClasses"', 'ID', id).then((res) => res.rows[0]);
	},
	list: function(filters){
		return api.list('public."TheClasses"', 'ID', filters).then((res) => res.rows);
	},
	toString: () => "Class",
	getProperties: () => ["Name", "Time", "Location", "Teacher ID", "Group ID"],
	getPropertyTypes: () => ["string", "integer", "point", "uuid", "uuid"],
	getReferences: () => [
		{
			paramSource: "Teacher ID",
			paramRef: "ID",
			refTableName: "public.\"Teachers\""
		},
		{
			paramSource: "Group ID",
			paramRef: "ID",
			refTableName: "public.\"Groups\""
		},
		{ // from journal entry
			paramSource: "ID",
			paramRef: "Class_ID",
			refTableName: "public.\"Journal Entries\""
		},
	],
};