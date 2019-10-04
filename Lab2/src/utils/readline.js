const readline = require('readline');

const rI = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

module.exports = {
	question: (text) => new Promise((res,rej) => rI.question(text, res)),
	close: ()=>new Promise((res,rej)=>(rI.close(),res()))
};