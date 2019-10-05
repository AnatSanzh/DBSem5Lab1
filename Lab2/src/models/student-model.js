const api = require('./api');


module.exports = class StudentModel{
	constructor(id, name, password){
		this.id = id;
		this.name = name;
		this.password = password;
	}
	static create(name, password, privileges, lastLocation, lastLocationTime, group_id){
		const config = {
			Student_ID: 'uuid_generate_v4()',
			Name: name,
			Password: password,
			Privileges: privileges,
			Group_ID: group_id,
			"Last Location": lastLocation,
			"Last Location Time": lastLocationTime
		};

		return api.create('public."Students"',config).then((res) => new TeacherModel(0,name,password));
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