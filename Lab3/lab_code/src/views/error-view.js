const prompt = require('../utils/prompt');

module.exports = async function(params) {
	console.log("Error: ");
	console.log(params.errorText/*.toString()*/);

	await prompt("Press ENTER to return");

	return { id: 'navigate', params: { path: '/', params: {} }};
};