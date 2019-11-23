const prompt = require('../utils/prompt');

module.exports = async function(params) {
	const { entityId, model } = params;

	const data = (await model.get(entityId)).toJSON();
	let result = "Data:\n\n";

	Object.keys(data).forEach(key => {
		let value = data[key];
		if(typeof value === 'object' && value !== null){
			value = JSON.stringify(value);
		}
		result += key + ": " + value + "\n";
	});

	console.log(result);

	await prompt("Press ENTER to return");

	return { id: 'navigate', params: { path: "/" + model.toString().toLowerCase(), params: {} }};
};