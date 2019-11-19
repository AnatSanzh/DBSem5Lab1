const prompt = require('../utils/prompt');
const api = require('../models/api');
const { fromKeys } = require('../utils/object-utils');
const modelNameDict = require('../models/model-dict');

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

module.exports = function(model) {
	const text =
	"{0}'s actions:\n1) Create\n2) Update\n3) Delete\n4) Show {1}\n5) Show {1} list\n6) Return to menu\n\n>"
	.format(model.toString(), model.toString().toLowerCase());

	const actionList = [
		async function(){
			let properties = fromKeys(model.getProperties());

			const types = model.getPropertyTypes();
			const fields = model.getProperties();

			for(let i = 0; i < fields.length; i++){
				const input = await prompt(`\nEnter ${fields[i]} (${types[i]}): `);
				
				if(input != "")
					properties[fields[i]] = input;
				else
					properties[fields[i]] = api.randomValue(types[i]);
			}

			return { id: 'create', params: properties };
		},
		async function(){
			let properties = {};

			const id = await prompt(`Enter ID (uuid): `);

			const types = model.getPropertyTypes();
			const fields = model.getProperties();

			for(let i = 0; i < fields.length; i++){
				const input = await prompt(`\nEnter ${fields[i]} (${types[i]}): `);

				if(input != "")
					properties[fields[i]] = input;
			}

			return { id: 'update', params: { id, properties } };
		},
		async function(){
			const id = await prompt(`Enter ID (uuid): `);

			if((await prompt("Are you shure? [Y/N]: ")).toLowerCase() != "y")
				return { id: 'noop' };

			return { id: 'delete', params: { id } };
		},
		async function(){
			const entityId = await prompt(`Enter ID (uuid): `);

			return { 
				id: 'navigate',
				params: {
					path: '/view-single',
					params: { entityId, model } 
				} 
			};
		},
		async function(){
			const filterCollectionFunction = async function(self, identation, _model) {
				const filters = [];

				const ident = "    ".repeat(identation);

				const types = _model.getPropertyTypes();
				const fields = _model.getProperties();

				while(true){
					const filterType = await prompt(ident + "Filter to apply(text,notext,range,enum,depend): ");

					let filter = { id: filterType };

					if(filterType == "text"){
						filter.param = await prompt(ident + "Parameter name: ");

						if(fields.indexOf(filter.param)<0)
							break;

						filter.paramValue = await prompt(ident + "Filtering text: ");
					}else if(filterType == "notext"){
						filter.param = await prompt(ident + "Parameter name: ");

						if(fields.indexOf(filter.param)<0)
							break;
						
						filter.paramValue = await prompt(ident + "Filtering text: ");
					}else if(filterType == "range"){
						filter.param = await prompt(ident + "Prameter name: ");

						if(fields.indexOf(filter.param)<0)
							break;

						filter.rangeStart = await prompt(ident + "Range start: ");
						filter.rangeEnd = await prompt(ident + "Range end: ");
					}else if(filterType == "enum"){
						filter.param = await prompt(ident + "Parameter name: ");

						const typeId = fields.indexOf(filter.param);

						if(typeId<0)
							break;

						let values = [];
						const formattingRule = api.getInputFormattingRule(types[typeId]);

						while(true){
							const value = await prompt(ident+`    Enum value ${values.length}: `);

							if(value!=""){
								values.push(formattingRule(value));
							}else{
								break;
							}
						}

						filter.paramValues = values;
					}else if(filterType == "depend"){
						const references = _model.getReferences();

						let text = "Table to associate with:\n";

						references.forEach((value, index) => {
							text += `${index}) ${value.refTableName}\n`;
						});

						const dependentTableID = Math.floor(Number(await prompt(text+"> ")));

						if(dependentTableID == undefined || dependentTableID < 0 || dependentTableID >= references.length){
							continue;
						}

						const selectedReference = references[dependentTableID];

						filter.paramSource = selectedReference.paramSource;
						filter.refTableName = selectedReference.refTableName;
						filter.refFilters = await self(self, identation+1, modelNameDict[selectedReference.refTableName]);
						filter.paramRef = selectedReference.paramRef;
					}else{
						break;
					}

					filters.push(filter);
				}

				return filters;
			};

			return {
				id: 'navigate',
				params: {
					path: '/view-list',
					params: {
						filters: await filterCollectionFunction(filterCollectionFunction, 0, model),
						model
					}
				}
			};
		},
		async () => ({ id: 'navigate', params: { path:'/', params:{} } }),
	];

	return async (params) => {
		const input = Number(await prompt(text));

		if(	input<1 || input>6 || Number.isNaN(input) 
			|| !Number.isFinite(input) || !Number.isSafeInteger(input) )
			return { id: 'noop' };

		return (actionList[input - 1] || actionList[6])();
	};
};