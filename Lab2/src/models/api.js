const { query } = require('./database');

const padLeft = srcStr => srcStr.length === 1 ? "0" + srcStr : srcStr;

const _dateConvertor = x => x.getFullYear()+"-"+padLeft(x.getMonth().toString())+"-"+padLeft(x.getDate().toString());
const _timestampConvertor = x => dateConvertor(x) + " " + padLeft(x.getHours())+":"+padLeft(x.getMinutes())+":"+padLeft(x.getSeconds());

const emptyFunction = async function(){};


function api_create(tableName, dataObject, dataFormattingRules){
	/*let paramStr = "$1", paramCount = Object.keys(dataObject).length;

		for (var i = 2; i <= paramCount; i++) {
			paramStr+=",$"+i;
		}

		return query('INSERT INTO '+tableName+' ('+
			Object.keys(dataObject).map( x => '"'+x+'"' ).join()+') VALUES ('+
			paramStr+') RETURNING *;', Object.values(dataObject)
		);*/
		return query('INSERT INTO '+tableName+' ('+
			Object.keys(dataObject).map( x => '"'+x+'"' ).join()+') VALUES ('+
			Object.entries(dataObject).map( ([x,y]) => dataFormattingRules[x](y) ).join()+') RETURNING *;'
		).then( res => res.rows );
}

const dateConvertor = x => "'" + _dateConvertor(x) + "'";
const timestampConvertor = x => "'" + _timestampConvertor(x) + "'";
const stringConvertor = x => "'" + x + "'";
const numberConvertor = x => x;
const booleanConvertor = x => x.toString();
const uuidConvertor = x => '\'' + x + '\'::uuid';
const pointConvertor = x => "(" + x.x + "," + x.y + ")";

const updateFormattingRulesConversion = {};
updateFormattingRulesConversion[dateConvertor] = stringConvertor;
updateFormattingRulesConversion[timestampConvertor] = stringConvertor;
updateFormattingRulesConversion[stringConvertor] = stringConvertor;
updateFormattingRulesConversion[numberConvertor] = numberConvertor;
updateFormattingRulesConversion[booleanConvertor] = numberConvertor;
updateFormattingRulesConversion[uuidConvertor] = uuidConvertor;
updateFormattingRulesConversion[pointConvertor] = numberConvertor;


function api_update(tableName, dataObject, dataFormattingRules, dataChangeActions, keyName, keyValue) {
	const filteredDataObjectKeys = Object.keys(dataObject)
	.filter(key => dataFormattingRules.hasOwnProperty(key));

	if(filteredDataObjectKeys.length === 0)
		return Promise.resolve([]);

	const formatedDataObject = filteredDataObjectKeys
	.reduce((obj, key) => {
		obj[key] = (updateFormattingRulesConversion[dataFormattingRules[key]])(dataObject[key]);

		return obj;
	}, {});

	return query(
		'SELECT * FROM '+tableName+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;'
	).then( res => Promise.all([
			res,
			query('UPDATE '+tableName+' SET '+
				Object.entries(formatedDataObject)
				.map( ([key,value]) => '"'+key+'" = '+value ).join()+' WHERE "'+
				keyName+'" = \''+keyValue+'\'::uuid RETURNING *;'
			)
		])
	).then(async ([prevRes,currRes]) => {
		/*const prevVals = prevRes.rows[0];
		const currVals = currRes.rows[0];

		for(const key of filteredDataObjectKeys){
			if(prevVals[key] != currVals[key])
				await (dataChangeActions[key] || emptyFunction)(prevVals[key], currVals[key]);
		}*/
	});
}
function api_delete(tableName, keyName, keyValue){
	return query('DELETE FROM '+tableName+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;');
}
function api_get(tableName, keyName, keyValue) {
	return query('SELECT * FROM '+tableName+' WHERE "'+keyName+'" = \''+keyValue+'\'::uuid;');
}

const fulltext_filter_incl = (_source, _textParam, _value) => `SELECT * FROM (${_source}) t WHERE to_tsvector('english',t."${_textParam}") @@ to_tsquery('english','${_value}')`;
const fulltext_filter_not_incl = (_source, _textParam, _value) => `SELECT * FROM (${_source}) t WHERE NOT to_tsvector('english',t."${_textParam}") @@ to_tsquery('english','${_value}')`;
const range_filter = (_source, _rangeParam, _rangeStart, _rangeEnd) => 
	`SELECT * FROM (${_source}) t WHERE t."${_rangeParam}" BETWEEN ${_rangeStart} AND ${_rangeEnd}`;
const enumeration_filter = (_source, _enumParam, _enumValues) => 
	`SELECT * FROM (${_source}) t WHERE t."${_enumParam}" IN (${_enumValues.join()})`;

const ref_table_filter = (_source, _sourceProp, _source2, _source2Prop) => 
	`SELECT * FROM (${_source1}) t1 WHERE EXISTS(SELECT "${_source2Prop}" FROM ((${_source2}) t2 WHERE t1."${_sourceProp}"=t2."${_source2Prop}" ))`;

function parse_filters(tableName, filters){
	let filterQuery = `SELECT * FROM ${tableName}`;

	for(let i=0;i < filters.length;i++){
		const filter = filters[i];

		if(filter.id == 'text'){
			filterQuery = fulltext_filter_incl(filterQuery, filter.param, filter.paramValue);
		}else if(filter.id == 'notext'){
			filterQuery = fulltext_filter_not_incl(filterQuery, filter.param, filter.paramValue);
		}else if(filter.id == 'range'){
			filterQuery = range_filter(filterQuery, filter.param, filter.rangeStart, filter.rangeEnd);
		}else if(filter.id == 'enum'){
			filterQuery = enumeration_filter(filterQuery, filter.param, filter.paramValues);
		}else if(filter.id == 'depend'){
			filterQuery = ref_table_filter(filterQuery, filter.paramSource, 
				parse_filters(filter.refTableName, filter.refFilters), filter.paramRef);
		}
	}

	return filterQuery;
}

function api_list(tableName, keyName, filters) {
	return query('SELECT * FROM ('+parse_filters(tableName, filters)+') t ORDER BY t."'+keyName+'" ASC;');
}


const deleteIfNoReferers = (tableName, referersTableName, keyName, refererKeyName, keyValue) =>
	query('DELETE FROM ' + tableName + ' WHERE "' + keyName + '" = \'' + keyValue + 
		'\'::uuid AND NOT EXISTS(SELECT FROM ' + referersTableName + ' WHERE "' +
		refererKeyName + '" = \'' + keyValue + '\'::uuid);');
const nullifyReferers = (refTableName, refKeyName, keyValue) =>
	query('UPDATE FROM '+ refTableName + ' WHERE "' + refKeyName + '" = \'' + keyValue +
		'\'::uuid SET "' + refKeyName + '" = NULL;');

function randomCharacterCode(){
	const randomCode = Math.floor(Math.random() * (10 + 2*26));
	return 48 + randomCode + Number(randomCode > 10)*8 + Number(randomCode > 37)*7;
}

function randomValue(type){
	return ({
		"string": (len = 10) => {
			let codes = new Array(len);

			for (let i = 0; i < len; i++) {
				codes[i] = randomCharacterCode();
			}

			return String.fromCharCode(...codes);
		},
		"integer": () => Math.trunc(Math.random()*Number.MAX_SAFE_INTEGER),
		"point": () => ({ x:0, y:0 }),
		"uuid": () => "NULL",
		"boolean": () => Math.random() >= 0.5,
		"date": () => new Date(10000000000000 * Math.random()),
		"timestamp without timezone": () => new Date(10000000000000 * Math.random()),
	})[type]();
}

function getInputFormattingRule(type){
	return ({
		"string": stringConvertor,
		"integer": numberConvertor,
		"point": numberConvertor,
		"uuid": uuidConvertor,
		"boolean": booleanConvertor,
		"date": stringConvertor,
		"timestamp without timezone": stringConvertor,
	})[type];
}

module.exports = {
	create: api_create,
	update: api_update,
	delete: api_delete,
	get: api_get,
	list: api_list,

	dateConvertor,
	timestampConvertor,
	stringConvertor,
	numberConvertor,
	booleanConvertor,
	uuidConvertor,
	pointConvertor,

	deleteIfNoReferers,
	nullifyReferers,

	randomValue,
	getInputFormattingRule,

	//check: (id) => 0,
};