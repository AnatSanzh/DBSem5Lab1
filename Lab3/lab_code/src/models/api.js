const { getManager } = require('typeorm');

const fulltext_filter_incl = (_source, _textParam, _value) => `SELECT * FROM (${_source}) t WHERE to_tsvector('english',t."${_textParam}") @@ to_tsquery('english','${_value}')`;
const fulltext_filter_not_incl = (_source, _textParam, _value) => `SELECT * FROM (${_source}) t WHERE NOT to_tsvector('english',t."${_textParam}") @@ to_tsquery('english','${_value}')`;
const range_filter = (_source, _rangeParam, _rangeStart, _rangeEnd) => 
	`SELECT * FROM (${_source}) t WHERE t."${_rangeParam}" BETWEEN ${_rangeStart} AND ${_rangeEnd}`;
const enumeration_filter = (_source, _enumParam, _enumValues) => 
	`SELECT * FROM (${_source}) t WHERE t."${_enumParam}" IN (${_enumValues.join()})`;

const ref_table_filter = (_source, _sourceProp, _source2, _source2Prop) => 
	`SELECT * FROM (${_source}) t1 WHERE EXISTS(SELECT "${_source2Prop}" FROM (${_source2}) t2 WHERE t1."${_sourceProp}"=t2."${_source2Prop}" )`;

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
	return getManager().query(
		`SELECT * FROM (${parse_filters(tableName, filters)}) t ORDER BY t."${keyName}" ASC;`
	);
}

function randomValue(type){
	return ({
		"string": (len = 10) => String.fromCharCode(...Array.from({length: 40}, () => 48 + Math.floor(Math.random() * 60))),
		"integer": () => Math.trunc(Math.random()*Number.MAX_SAFE_INTEGER),
		"point": () => ({ x: 0, y:0 }),
		"uuid": () => null,
		"boolean": () => Math.random() >= 0.5,
		"date": () => new Date(10000000000000 * Math.random()),
		"timestamp without timezone": () => new Date(10000000000000 * Math.random()),
	})[type]();
}

function randomizeUndefinedFields(fields, allFields, allFieldTypes){
	return allFields.reduce((accum, currField, currIdx) => {
		accum[currField] = fields[currField] || randomValue(allFieldTypes[currIdx]);

		return accum;
	},{});
}

module.exports = {
	list: api_list,

	randomValue,
	randomizeUndefinedFields,
};