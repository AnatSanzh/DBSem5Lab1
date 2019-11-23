/*const api = require('./api');
const sequelize = require('./database');
const Sequelize = require('sequelize');

const Group = sequelize.define('groups', {
	ID: {
		type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
	},
	Name: {
		type: Sequelize.DataTypes.TEXT,
	},
	Faculty: {
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

@Entity("groups")
//@Unique(["ID"])
class Group extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  ID: string;

  @Column("text")
  Name: string;

  @Column("text")
  Faculty: string;
}

const getProperties = () => ["Name", "Faculty"];
const getPropertyTypes = () => ["string", "string"];

export default {
	create: function(paramValues){
		return Group.create(
			api.randomizeUndefinedFields(
				paramValues,
				getProperties(),
				getPropertyTypes()
			)
		).save();
	},
	update: function(id, properties){
		return Group.update( id, properties);
	},
	delete: function(id){
		return Group.delete( id);
	},
	get: function(id){
		return Group.findOne( id);
	},
	list: function(filters){
		return api.list('public.groups', 'ID', filters);
	},
	toString: () => "Group",
	getProperties,
	getPropertyTypes,
	getReferences: () => [
		{ // from class
			paramSource: "ID",
			paramRef: "Group ID",
			refTableName: "public.the_classes"
		},
		{ // from student
			paramSource: "ID",
			paramRef: "Group_ID",
			refTableName: "public.students"
		},
	],
	entity: Group
};