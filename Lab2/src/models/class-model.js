const api = require('./api');


module.exports = class ClassModel{
	constructor(id, name, time, location, teacher_id, group_id){
		this.id = id;
		this.name = name;
		this.time = time;
		this.location = location;
		this.teacher_id = teacher_id;
		this.group_id = group_id;
	}
	static create(name, time, location, teacher_id, group_id){
		const config = {
			ID: 'uuid_generate_v4()',
			Name: name,
			Time: time,
			Location: location,
			"Teacher ID": teacher_id,
			"Group ID": group_id
		};

		return api.create('public."TheClasses"',config).then((res) => new TeacherModel(0,name,password));
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