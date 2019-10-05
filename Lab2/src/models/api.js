const { query } = require('./database');

module.exports = {
	create: (tableName, dataObject) => 
		query('INSERT INTO '+tableName+' ('+Object.keys(dataObject).map( x => '"'+x+'"' ).join()+') VALUES ('+Object.values(dataObject).join()+');'),
	update: (tableName, dataObject, keyName, keyValue) =>
		query('UPDATE '+tableName+' SET '+Object.entries(dataObject).map( ([key,value]) => '"'+key+'" = '+value ).join()+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;'),
	delete: (tableName, keyName, keyValue) =>
		query('DELETE FROM '+tableName+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;'),
	get: (tableName, keyName, keyValue) =>
		query('SELECT * FROM '+tableName+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;'),
	list: (tableName, keyName, filters) =>
		query('SELECT * FROM '+tableName+' ORDER BY "'+keyName+'" ASC;'), // add filter usage
};