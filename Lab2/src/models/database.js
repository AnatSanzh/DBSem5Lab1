const { Pool } = require('pg');
const prompt = require('../utils/prompt');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: ' ',
	port: 5432
});

pool.connect().then(() => pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'));

module.exports = {
	query: (queryText, paramArr = undefined) => new Promise((res, rej) => {
		console.log(queryText);

		pool.query(queryText, paramArr, (err, result) => {
			if(err){
				rej(err);
			}else{
				res(result);
				//prompt("enter enter").then(() => res(result));
			}
		});
	})
};