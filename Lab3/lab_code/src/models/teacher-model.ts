/*const api = require('./api');
const sequelize = require('./database');
const Sequelize = require('sequelize');

const Teacher = sequelize.define('teachers', {
	ID: {
		type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
	},
	Name: {
		type: Sequelize.DataTypes.TEXT
	},
	Password: {
		type: Sequelize.DataTypes.TEXT
	}
}, {
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

@Entity("teachers")
//@Unique(["ID"])
class Teacher extends BaseEntity{
  @PrimaryGeneratedColumn("uuid")
  ID: string;

  @Column("text")
  Name: string;

  @Column("text")
  Password: string;
}

const getProperties = () => ["Name", "Password"];
const getPropertyTypes = () => ["string", "string"];

export default {
	create: function(paramValues){
		return Teacher.create(
			api.randomizeUndefinedFields(
				paramValues,
				getProperties(),
				getPropertyTypes()
			)
		).save();
	},
	update: function(id, properties){
		return Teacher.update(id, properties);
	},
	delete: function(id){
		return Teacher.delete(id);
	},
	get: function(id){
		return Teacher.findOne(id);
	},
	list: function(filters){
		return api.list('public.teachers', 'ID', filters);
	},
	toString: () => "Teacher",
	getProperties,
	getPropertyTypes,
	getReferences: () => [
		{ // from class
			paramSource: "ID",
			paramRef: "Teacher ID",
			refTableName: "public.the_classes"
		},
	],
	entity: Teacher
};