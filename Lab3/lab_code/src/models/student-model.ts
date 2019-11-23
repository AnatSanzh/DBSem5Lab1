/*const api = require('./api');
const sequelize = require('./database');
const Sequelize = require('sequelize');

class Student extends Sequelize.Model {}

Student.init({
	Student_ID: {
		type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
	},
	Name: {
		type: Sequelize.TEXT,
	},
	Password: {
		type: Sequelize.TEXT
	},
	Privileges: {
		type: Sequelize.BOOLEAN
	},
	Group_ID: {
		type: Sequelize.UUID
	},
	Last_Location: {
		type: Sequelize.POINT,
		field: "Last Location"
	},
	Last_Location_Time: {
		type: Sequelize.DATE,
		field: "Last Location Time"
	},
}, {
	sequelize,
	modelName: 'students',
	timestamps: false,
	freezeTableName: true
});*/
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,

  BaseEntity
} from "typeorm";
import * as api from "./api";

@Entity("students")
//@Unique(["Student_ID"])
class Student extends BaseEntity{
  @PrimaryGeneratedColumn("uuid")
  Student_ID: string;

  @Column("text")
  Name: string;

  @Column("text")
  Password: string;

  @Column("boolean")
  Privileges: boolean;

  @Column("uuid")
  Group_ID: string;

  @Column({
    name: "Last Location",
    type: 'point',
    nullable: true,
    transformer: {
      from: v => `(${v.x},${v.y})`, // good as-is
      to: v => v, // { x: 1, y: 2 } -> '1,2'
    },
  })
  Last_Location: string;
  
  @Column({ type: "timestamp without time zone", name: "Last Location Time"})
  Last_Location_Time: Date;
}

const getProperties = () => ["Name", "Password", "Privileges", "Last_Location", "Last_Location_Time", "Group_ID"];
const getPropertyTypes = () => ["string", "string", "boolean", "point", "timestamp without timezone", "uuid"];

export default {
	create: function(paramValues){
		return Student.create(
			api.randomizeUndefinedFields(
				paramValues,
				getProperties(),
				getPropertyTypes()
			)
		).save();
	},
	update: function(id, properties){
		return Student.update(id, properties);
	},
	delete: function(id){
		return Student.delete(id);
	},
	get: function(id){
		return Student.findOne(id);
	},
	list: function(filters){
		return api.list('public.students', 'Student_ID', filters);
	},
	toString: () => "Student",
	getProperties,
	getPropertyTypes,
	getReferences: () => [
		{
			paramSource: "Group_ID",
			paramRef: "ID",
			refTableName: "public.groups"
		},
		{ // from journal entry
			paramSource: "ID",
			paramRef: "Student_ID",
			refTableName: "public.journal_entries"
		},
	],
	entity: Student
};