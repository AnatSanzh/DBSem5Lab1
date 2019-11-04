const api = require('./api');

const dataFormattingRules = {
	Name: api.stringConvertor,
	Password: api.stringConvertor,
	Privileges: api.booleanConvertor,
	Group_ID: api.uuidConvertor,
	"Last Location": api.pointConvertor,
	"Last Location Time": api.timestampConvertor					// Timestamp(0) without timezone
};

module.exports = {
	create: function({name, password, privileges, lastLocation, lastLocationTime, group_id}){
		let config = paramValues;

		config["Student_ID"] = 'uuid_generate_v4()';

		return api.create('public."Students"', config, dataFormattingRules)
		.then((res) => res.rows[0]);
	},
	update: function(id, properties){
		return api.update('public."Students"', properties, dataFormattingRules, { }, 'Student_ID', id);
	},
	delete: function(id){
		return api.delete('public."Students"', 'Student_ID', id).then(
			() => api.delete('public."Journal Entries"', 'Student_ID', id)
		);
	},
	get: function(id){
		return api.get('public."Students"', 'Student_ID', id).then((res) => res.rows[0]);
	},
	list: function(filters){
		return api.list('public."Students"', 'Student_ID', filters).then((res) => res.rows);
	},
	toString: () => "Student",
	getProperties: () => ["Name", "Password", "Privileges", "Last Location", "Last Location Time", "Group_ID"],
	getPropertyTypes: () => ["string", "string", "boolean", "point", "timestamp without timezone", "uuid"],
	getReferences: () => [
		{
			paramSource: "Group_ID",
			paramRef: "ID",
			refTableName: "public.\"Groups\""
		},
		{ // from journal entry
			paramSource: "ID",
			paramRef: "Student_ID",
			refTableName: "public.\"Journal Entries\""
		},
	],
};