const api = require('./api');

const dataFormattingRules = {
	Name: api.stringConvertor,
	Faculty: api.stringConvertor
};

module.exports = {
	create: function(paramValues){
		return api.create('public."Groups"', paramValues, dataFormattingRules, 'ID');
	},
	update: function(id, properties){
		return api.update('public."Groups"', properties, dataFormattingRules, {}, 'ID', id);
	},
	delete: function(id){
		return api.delete('public."Groups"', 'ID', id).then(
			() => api.delete('public."TheClasses"', 'ID', id)
		).then(
			() => api.nullifyReferers('public."Students"', 'Group_ID', id)
		);
	},
	get: function(id){
		return api.get('public."Groups"', 'ID', id).then((res) => res.rows[0]);
	},
	list: function(filters){
		return api.list('public."Groups"', 'ID', filters).then((res) => res.rows);
	},
	toString: () => "Group",
	getProperties: () => ["Name", "Faculty"],
	getPropertyTypes: () => ["string", "string"],
	getReferences: () => [
		{ // from class
			paramSource: "ID",
			paramRef: "Group ID",
			refTableName: "public.\"TheClasses\""
		},
		{ // from student
			paramSource: "ID",
			paramRef: "Group_ID",
			refTableName: "public.\"Students\""
		},
	],
};