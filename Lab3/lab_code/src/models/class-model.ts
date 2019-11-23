/*const api = require('./api');
const sequelize = require('./database');
const Sequelize = require('sequelize');

const TheClass = sequelize.define('the_classes', {
	ID: {
		type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
	},
	Name: {
		type: Sequelize.DataTypes.TEXT,
	},
	Time: {
		type: Sequelize.DataTypes.INTEGER
	},
	Location: {
		type: Sequelize.DataTypes.GEOMETRY('POINT')
	},
	Teacher_ID: {
		type: Sequelize.DataTypes.UUID,
		field: "Teacher ID"
	},
	Group_ID: {
		type: Sequelize.DataTypes.UUID,
		field: "Group ID"
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

@Entity("the_classes")
//@Unique(["ID"])
class TheClass extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  ID: string;

  @Column("text")
  Name: string;

  @Column("integer")
  Time: number;

  @Column({
    type: 'point',
    nullable: true,
    transformer: {
      from: v => `(${v.x},${v.y})`, // good as-is
      to: v => v, // { x: 1, y: 2 } -> '1,2'
    },
  })
  Location: string;

  @Column({ type: "uuid", name: "Teacher ID"})
  Teacher_ID: string;

  @Column({ type: "uuid", name: "Group ID"})
  Group_ID: string;
}


const getProperties = () => ["Name", "Time", "Location", "Teacher_ID", "Group_ID"];
const getPropertyTypes = () => ["string", "integer", "point", "uuid", "uuid"];

export default {
	create: function(paramValues){
		return TheClass.create(
			api.randomizeUndefinedFields(
				paramValues,
				getProperties(),
				getPropertyTypes()
			)
		).save();
	},
	update: function(id, properties){
		return TheClass.update(id, properties);
	},
	delete: function(id){
		return TheClass.delete(id);
	},
	get: function(id){
		return TheClass.findOne(id);
	},
	list: function(filters){
		return api.list('public.the_classes', 'ID', filters);
	},
	toString: () => "Class",
	getProperties,
	getPropertyTypes,
	getReferences: () => [
		{
			paramSource: "Teacher ID",
			paramRef: "ID",
			refTableName: "public.teachers"
		},
		{
			paramSource: "Group ID",
			paramRef: "ID",
			refTableName: "public.groups"
		},
		{ // from journal entry
			paramSource: "ID",
			paramRef: "Class_ID",
			refTableName: "public.journal_entries"
		},
	],
	entity: TheClass
};