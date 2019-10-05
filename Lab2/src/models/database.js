const { Pool } = require('pg');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: ' ',
	port: 5432
});

pool.connect().then(()=> pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'));

module.exports = {
	query: (queryText) => new Promise((res,rej) => {
		console.log(queryText);

		pool.query(queryText,(err, result)=>{
			if(err){
				rej(err);
			}else{
				res(result);
			}
		})
	})
};