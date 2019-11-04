const api = require('./api');

const dataFormattingRules = {
	Name: api.stringConvertor,
	Password: api.stringConvertor,
};

module.exports = {
	create: function({name, password}){
		let config = paramValues;

		config["ID"] = 'uuid_generate_v4()';

		return api.create('public."Teachers"', config, dataFormattingRules)
		.then((res) => res.rows[0]);
	},
	update: function(id, properties){
		return api.update('public."Teachers"', properties, dataFormattingRules, {}, 'ID', id);
	},
	delete: function(id){
		return api.delete('public."Teachers"', 'ID', id).then(
			() => api.delete('public."TheClasses"','ID',id)
		);
	},
	get: function(id){
		return api.get('public."Teachers"', 'ID', id).then((res) => res.rows[0]);
	},
	list: function(filters){
		return api.list('public."Teachers"', 'ID', filters).then((res) => res.rows);
	},
	toString: () => "Teacher",
	getProperties: () => ["Name", "Password"],
	getPropertyTypes: () => ["string", "string"],
	getReferences: () => [
		{ // from class
			paramSource: "ID",
			paramRef: "Teacher ID",
			refTableName: "public.\"TheClasses\""
		},
	],
};