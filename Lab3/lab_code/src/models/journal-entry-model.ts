/*const api = require('./api');
const sequelize = require('./database');
const Sequelize = require('sequelize');

const JournalEntry = sequelize.define('journal_entries', {
	ID: {
		type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
	},
	Date: {
		type: Sequelize.DataTypes.DATE,
	},
	Student_ID: {
		type: Sequelize.DataTypes.UUID
	},
	Class_ID: {
		type: Sequelize.DataTypes.UUID
	},
	Did_Attended: {
		type: Sequelize.DataTypes.BOOLEAN,
		field: "Did Attended"
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

@Entity("journal_entries")
//@Unique(["ID"])
class JournalEntry extends BaseEntity{
  @PrimaryGeneratedColumn("uuid")
  ID: string;

  @Column("date")
  Date: Date;

  @Column({ type: "boolean", name: "Did Attended" })
  Did_Attended: boolean;

  @Column("uuid")
  Student_ID: string;

  @Column("uuid")
  Class_ID: string;
}


const getProperties = () => ["Student_ID", "Class_ID", "Date", "Did_Attended"];
const getPropertyTypes = () => ["uuid", "uuid", "date", "boolean"];

export default {
	create: function(paramValues){
		return JournalEntry.create(
			api.randomizeUndefinedFields(
				paramValues,
				getProperties(),
				getPropertyTypes()
			)
		).save();
	},
	update: function(id, properties){
		return JournalEntry.update(id, properties);
	},
	delete: function(id){
		return JournalEntry.delete(id);
	},
	get: function(id){
		return JournalEntry.findOne(id);
	},
	list: function(filters){
		return api.list('public.journal_entries', 'ID', filters);
	},
	toString: () => "Journal entry",
	getProperties,
	getPropertyTypes,
	getReferences: () => [
		{
			paramSource: "Student_ID",
			paramRef: "Student_ID",
			refTableName: "public.students"
		},
		{
			paramSource: "Class_ID",
			paramRef: "ID",
			refTableName: "public.the_classes"
		},
	],
	entity: JournalEntry
};