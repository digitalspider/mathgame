import { JSONB } from "sequelize";
import { Column, Model, PrimaryKey, Table, Unique, HasMany, ForeignKey, Default, BelongsTo } from 'sequelize-typescript';
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
  password?: string;

  @Unique
  @Column
  email!: string;

  @Column(JSONB)
  settings!: Setting;

  @Column
  age?: number;

  @Default(0)
  @Column
  fastestSpeed!: number;

  @Column
  accessToken?: string;

  @Column
  refreshToken?: string;

  @Default(0)
  @Column
  points!: number;

  @Default(0)
  @Column
  level!: number;

  @Column
  displayName!: string;

  @Column
  oldEmail?: string;

  @ForeignKey(() => Country)
  @Column
  countryId?: string;

  @ForeignKey(() => State)
  @Column
  stateId?: string;

  @ForeignKey(() => School)
  @Column
  schoolId?: string;

  @BelongsTo(() => Country)
  country?: Country;

  @BelongsTo(() => State)
  state?: State;

  @BelongsTo(() => School)
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

  @Unique
  @Column
  googleId?: string;

  // @HasMany(() => Game, 'username')
  // games!: Game[];
}

export { User };

