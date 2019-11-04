const prompt = require('../utils/prompt');

module.exports = async function(params) {
	const { entityId, model } = params;

	const data = await model.get(entityId);
	let result = "Data:\n\n";

	Object.keys(data).forEach(key => {
		result += key + ": " + data[key] + "\n";
	});

	console.log(result);

	await prompt("Press ENTER to return");

	return { id: 'navigate', params: { path: "/" + model.toString().toLowerCase(), params: {} }};
};