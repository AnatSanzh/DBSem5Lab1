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
//to_tsvector('english', \"Name\")
connection.then( conn => conn.query(
	`
	CREATE OR REPLACE FUNCTION public.student_name_tsv_upd_func() RETURNS trigger AS $BODY$
	BEGIN
		UPDATE public.students s SET name_tsv = to_tsvector('english',coalesce(NEW."Name",'')) WHERE s."Student_ID"=NEW."Student_ID";
		RETURN NULL;
	END;
	$BODY$ LANGUAGE 'plpgsql';` +

	`
	DROP TRIGGER IF EXISTS student_name_tsv_upd_triggr ON students;
	CREATE TRIGGER student_name_tsv_upd_triggr
	AFTER INSERT OR UPDATE OF "Name" ON public.students
    FOR EACH ROW EXECUTE PROCEDURE public.student_name_tsv_upd_func();`+

	"DROP INDEX public.students_name_index;" +

	"CREATE INDEX students_name_index ON public.students USING gin(name_tsv);"
	)
);

export default connection;