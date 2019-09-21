import { Question } from './Question';
import { Setting } from './Setting';
import {User} from './User.model';
import { Table, PrimaryKey, Column, Default, AllowNull } from 'sequelize-typescript';
import { JSONB, Model } from 'sequelize';

@Table({
  tableName: 'game',
  modelName: 'Game',
  timestamps: true,
})
class Game extends Model<Game> {
  @PrimaryKey
  @Column
  id!: string;

  @AllowNull(false)
  @Column(JSONB)
  user!: User;

  @AllowNull(false)
  @Column(JSONB)
  settings!: Setting;

  @AllowNull(false)
  @Column(JSONB)
  questions!: Question[];

  @Column
  startTime?: Date;

  @Column
  endTime?: Date;

  @Column
  durationInMs?: number;

  @Default(0)
  @Column
  errors: number = 0;

  @Default(0)
  @Column
  score: number = 0;

  @Column
  display?: string;

  @Default(0)
  @Column
  answered: number = 0;

  @Default(false)
  @Column
  completed: boolean = false;

  static createFrom(id: string, user: User, settings: Setting, questions: Question[]): Game {
    let game: Game = new Game();
    game.id = id;
    game.user = user;
    game.settings = settings;
    game.questions = questions;
    return game;
  }
}

export { Game };
