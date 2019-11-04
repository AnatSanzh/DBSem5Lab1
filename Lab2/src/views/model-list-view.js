const prompt = require('../utils/prompt');

module.exports = async function(params) {
	const { filters, model } = params;

	const entities = await model.list(filters);
	let result = `${model.toString()}'s:\n\n`;

	entities.forEach(data => {
		result += "------------------------------------\n";

		Object.keys(data).forEach(key => {
			result += key + ": " + data[key] + "\n";
		})
	});

	console.log(result);

	await prompt("Press ENTER to return");

	return { id: 'navigate', params: { path: "/" + model.toString().toLowerCase(), params: {} }};
};