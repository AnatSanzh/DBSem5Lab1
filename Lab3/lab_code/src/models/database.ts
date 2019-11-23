import "reflect-metadata";
import { createConnection } from "typeorm";

const connection = createConnection({
	type:'postgres',
	
	username: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: ' ',
	port: 5432,
    schema: "public",

    synchronize: false,
    logging: false,
    entities: [__dirname + "/*-model.js"]
});

export default connection;