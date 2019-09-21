import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { JSONB } from "sequelize";
import { Setting } from "./Setting";

@Table({
  tableName: 'user',
  modelName: 'User',
  timestamps: true,
})
class User extends Model<User> {
  @PrimaryKey
  @Column
  username!: string;

  @Column
  password!: string;

  @Unique
  @Column
  email!: string;

  @Column(JSONB)
  settings!: Setting;
}

export {User};