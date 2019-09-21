import { JSONB } from "sequelize";
import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
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

  // @HasMany(() => Game)
  // games!: Game[];

  static createFrom(username: string, password: string, email: string, settings: Setting): User {
    let user: User = new User();
    user.username = username;
    user.password = password;
    user.email = email;
    user.settings = settings;
    return user;
  }
}

export { User };

