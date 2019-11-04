const prompt = require('../utils/prompt');

const text =
`Menu:
1) Groups
2) Students
3) Teachers
4) Journal Entries
5) Classes
6) Exit

>`;

const options = [
	{ id: 'navigate', params: { path: '/group', params: {} } },
	{ id: 'navigate', params: { path: '/student', params: {} } },
	{ id: 'navigate', params: { path: '/teacher', params: {} } },
	{ id: 'navigate', params: { path: '/journal-entry', params: {} } },
	{ id: 'navigate', params: { path: '/class', params: {} } },
	{ id: 'exit' }
];

module.exports = async function(params) {
	const input = Number(await prompt(text));

	if(	input < 1 || input > 6 || Number.isNaN(input) 
		|| !Number.isFinite(input) || !Number.isSafeInteger(input) )
			return { id: 'noop' };

	return options[input - 1];
};