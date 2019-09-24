import { JSONB } from "sequelize";
import { Column, Model, PrimaryKey, Table, Unique, HasMany, ForeignKey, DataType, Default } from 'sequelize-typescript';
import { Setting } from "./Setting";
import { Game } from "./Game.model";
import { Country } from "./Country.model";
import { State } from "./State.model";
import { School } from "./School.model";

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

  @Column
  age?: number;

  @Default(0)
  @Column
  points?: number;

  @Default(0)
  @Column
  level?: number;

  @Column
  displayName?: string;

  @Column
  oldEmail?: string;

  @ForeignKey(() => Country)
  @Column(DataType.STRING)
  country?: Country;

  @ForeignKey(() => State)
  @Column(DataType.STRING)
  state?: State;

  @ForeignKey(() => School)
  @Column(DataType.STRING)
  school?: School;

  @Default(true)
  @Column
  showAge!: boolean;

  @Default(true)
  @Column
  showSchool!: boolean;

  @Default(false)
  @Column
  showEmail!: boolean;

  // @HasMany(() => Game, 'username')
  // games!: Game[];
}

export { User };

