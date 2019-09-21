import { Question } from './Question';
import { Setting } from './Setting';
import {User} from './User.model';

class Game {
  constructor(
    public id: string,
    public user: User,
    public settings: Setting,
    public questions: Question[] = new Array<Question>(),
    public startTime?: Date,
    public endTime?: Date,
    public durationInMs?: number,
    public errors: number = 0,
    public score: number = 0,
    public display?: string,
    public answered: number = 0,
    public completed: boolean = false,
  ) {}
}

export { Game };
