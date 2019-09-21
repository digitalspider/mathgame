import { JSONB } from "sequelize";
import { Column, Model, PrimaryKey, Table, Unique, HasMany } from 'sequelize-typescript';
import { Setting } from "./Setting";
import { Game } from "./Game.model";

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

  // @HasMany(() => Game, 'username')
  // games!: Game[];
}

export { User };

