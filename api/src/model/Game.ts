import { Question } from './Question';
import { Setting } from './Setting';
import { User } from './User';

class Game {
  constructor(public id: number, public user: User, public settings: Setting, public questions: Question[]) {
  }
}

export { Game };
