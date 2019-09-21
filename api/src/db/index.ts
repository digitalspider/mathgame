import {Sequelize} from 'sequelize-typescript';
import { DB_HOST, DB_USER, DB_PASS, DB_PORT, DB_NAME } from '../config';
 
const sequelize =  new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  dialect: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  models: [__dirname + './../model/**/*.model.*s'],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member;
  },
});

/*
Object.keys(sequelize.models).forEach((model: string) => {
  console.log(model);
  console.log(sequelize.models[model].tableName);
});
*/

export { sequelize };