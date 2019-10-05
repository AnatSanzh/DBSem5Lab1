const api = require('./api');


module.exports = class JournalEntryModel{
	constructor(id, name, password){
		this.id = id;
		this.name = name;
		this.password = password;
	}
	static create(student_id, class_id, date, didAttend){
		const config = {
			ID: 'uuid_generate_v4()',
			Date: date,
			"Did Attended": didAttend,
			Student_ID: student_id,
			Class_ID: class_id
		};

		return api.create('public."Journal Entries"',config).then((res) => new TeacherModel(0,name,password));
	}
	static update(id, name, password){
		return api.update('public."Teachers"',{ Name: name, Password: password }, 'ID',id)
		.then((res) => new TeacherModel(0,name,password));
	}
	static delete(id){
		return api.delete('public."Teachers"','ID',id);
	}
	static get(id){
		return api.get('public."Teachers"', 'ID', id).then((res) =>{
			var data = res.rows[0];

			return new TeacherModel(id,data['Name'],data['Password']);
		});
	}
	static list(){
		return api.list('public."Teachers"', 'ID', {}).then((res) =>{
			return res.rows.map( data => new TeacherModel(data['ID'],data['Name'],data['Password']));
		});
	}
};