# Лабораторна робота №2
## Завдання
Варіант: 24

Пошук за атрибутами: діапазон чисел, перелічення.<br>
Повнотекстовий пошук: слово не входить, обов’язкове входження слова.
## Нормалізована модель даних

У відношеннях зберігаються атомарні дані, у якості `primary key` всюди виступає
лише один атрибут, та транзитивних залежностей другорядних атрибутів від первинних
не знайдено. А отже розроблена БД цілком перебуває у 3НФ.

| ВІДНОШЕННЯ | АТРИБУТ | ТИП (РОЗМІР) |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| Groups | ID - ідентифікатор сутності групи <br>Faculty - факультет, до якого належить група <br>Name - назва групи | uuid <br>text <br>text |
| Journal Entries | ID - ідентифікатор сутності запису "про відвідування студентом заняття" <br>Student_ID - ідентифікатор сутності студента, факт присутності(відсутності) якого зберігається в записі <br>Class_ID - ідентифікатор сутності заняття, на якому був пристутній(відсутній) студент <br>Date - дата проведення заняття <br>Did Attended - чи був пристутній студент, чи - відсутній | uuid <br>uuid <br>uuid <br>date <br>boolean |
| Students | Name - ПІБ студента <br>Student_ID - ідентифікатор сутності студента <br>Privileges - чи є студент старостою, чи ні <br>Last Location - координати останньго записаного положення студента <br>Last Location Time - час, коли координати останнього положення були записані <br>Password - зашифрований пароль <br>Group_ID - ідентифікатор сутності групи, до якої належить студент | text <br>uuid <br>boolean <br>point timestamp(0) without timezone <br>text <br>uuid |
| Teachers | ID - ідентифікатор сутності викладача <br>Name - ПІБ викладача <br>Password - зашифрований пароль викладача | uuid <br>text <br>text |
| TheClasses | ID - ідентифікатор сутності заняття <br>Name - назва заняття <br>Time - на котрій парі під час тижня проводиться заняття <br>Location - координати аудиторії в якій проводиться заняття <br>Teacher - ідентифікатор сутності викладача, який проводить заняття <br>Group - ідентифікатор сутності групи, для якої проводиться заняття | uuid <br>text <br>integer <br>point <br>uuid <br>uuid |

### SQL

```sql
CREATE TABLE public."Groups"
(
    "Name" text COLLATE pg_catalog."default",
    "Faculty" text COLLATE pg_catalog."default",
    "ID" uuid NOT NULL,
    CONSTRAINT "Groups_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT unique_bla1_group UNIQUE ("ID")

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Journal Entries"
(
    "Student_ID" uuid,
    "Date" date,
    "Did Attended" boolean,
    "ID" uuid NOT NULL,
    "Class_ID" uuid,
    CONSTRAINT "Journal Entries_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT je_unique_bla UNIQUE ("ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Class_ID")
        REFERENCES public."TheClasses" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT bla2 FOREIGN KEY ("Student_ID")
        REFERENCES public."Students" ("Student_ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Students"
(
    "Name" text COLLATE pg_catalog."default" NOT NULL,
    "Privileges" boolean,
    "Last Location" point,
    "Password" text COLLATE pg_catalog."default",
    "Group_ID" uuid,
    "Last Location Time" timestamp(0) without time zone,
    "Student_ID" uuid,
    CONSTRAINT "Students_pkey" PRIMARY KEY ("Name"),
    CONSTRAINT unique_bla1 UNIQUE ("Student_ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Group_ID")
        REFERENCES public."Groups" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Teachers"
(
    "Name" text COLLATE pg_catalog."default" NOT NULL,
    "Password" text COLLATE pg_catalog."default" NOT NULL,
    "ID" uuid NOT NULL,
    CONSTRAINT "Teachers_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT teacher_unique_bla UNIQUE ("ID")

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."TheClasses"
(
    "Time" integer,
    "Location" point,
    "Teacher ID" uuid,
    "Group ID" uuid,
    "ID" uuid NOT NULL,
    "Name" text COLLATE pg_catalog."default",
    CONSTRAINT "TheClasses_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT class_unique_bla UNIQUE ("ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Teacher ID")
        REFERENCES public."Teachers" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT bla2 FOREIGN KEY ("Group ID")
        REFERENCES public."Groups" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
```

## Лістинги програм з директивами внесення, редагування, вилучення та пошуку даних у базі даних та результати виконання цих директив

`models/api.js`

```javascript
const { query } = require('./database');

const padLeft = srcStr => srcStr.length === 1 ? "0" + srcStr : srcStr;

const _dateConvertor = x => x.getFullYear()+"-"+padLeft(x.getMonth().toString())+"-"+padLeft(x.getDate().toString());
const _timestampConvertor = x => dateConvertor(x) + " " + padLeft(x.getHours())+":"+padLeft(x.getMinutes())+":"+padLeft(x.getSeconds());

const emptyFunction = async function(){};


function api_create(tableName, dataObject, dataFormattingRules, keyName){
	/*let paramStr = "$1", paramCount = Object.keys(dataObject).length;

		for (var i = 2; i <= paramCount; i++) {
			paramStr+=",$"+i;
		}

		return query('INSERT INTO '+tableName+' ('+
			Object.keys(dataObject).map( x => '"'+x+'"' ).join()+') VALUES ('+
			paramStr+') RETURNING *;', Object.values(dataObject)
		);*/

		let valueNames = Object.keys(dataObject).map( x => '"'+x+'"' );
		valueNames.unshift('"'+keyName+'"');

		let values = Object.entries(dataObject).map( ([key, value]) => dataFormattingRules[key](value) );
		values.unshift('uuid_generate_v4()');

		return query('INSERT INTO '+tableName+' ('+valueNames.join()+') VALUES ('+
			values.join()+') RETURNING *;'
		);
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
};
```

### Процес внесення даних та його результат

![insert](img/inserting.png)

![insert](img/insert_result.png)

![insert](img/after_insert.png)

### Процес редагування, результат операцій

![update](img/updating.png)

![update](img/update_result.png)

### Процес вилучення даних, результат операцій

![delete](img/deleting.png)

![delete](img/delete_result.png)

![list](img/list_all.png)

## Лістинг модуля «модель» згідно із шаблоном MVC

`models/class-models.js`

```javascript
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
		return api.create('public."TheClasses"', paramValues, dataFormattingRules, 'ID');
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
```

## Скріншоти результатів виконання операції вилучення запису батьківської таблиці та виведення вмісту дочірньої таблиці після цього вилучення, а якщо воно неможливе, то результат перехоплення помилки з виведенням повідомлення про неможливість видалення за наявності залежних даних

Список накладних:

![invoices](img/invoices_list.png)

Список товарів:

![goods](img/goods_list.png)

Як бачимо, тільки накладна №4 немає товарів

Видалимо цю накладну:

![invoice delete](img/invoice_delete.png)

Як бачимо результат успішний:

![operation delete invoice result](img/invoice_success.png)

Спробуємо видалити іншу накладну:

![invoice delete another](img/invoice_another_delete.png)

Отримуємо помилку:

![invoice delete error](img/invoice_error.png)

Список накладних після зроблених операцій:

![invoice list after all](img/invoice_list_after.png)
