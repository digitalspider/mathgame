import { BadRequestError, NotFoundError } from 'routing-controllers';
import Container, { Service, Inject } from 'typedi';
import { Game } from '../model/Game';
import { Setting } from '../model/Setting';
import { User } from '../model/User';
import { QuestionService } from '../service/QuestionService';

@Service()
class GameService {

  games: Map<number,Game>;
  constructor(
    private questionService: QuestionService,
  ) {
    this.games = new Map<number,Game>();
  }

  getGame(id: number, user: User) {
    let game = this.games.get(id);
    if (!game) {
      throw new NotFoundError(`Game ${id} does not exist`);
    }
    if (game && game.user !== user) {
      throw new BadRequestError(`Game ${id} does not belong to ${user.username}`);
    }
    return game;
  }

  createGame(user: User) {
    let questions = this.createQuestions(user.settings);
    let game = new Game(this.games.size, user, user.settings, questions);
    this.games.set(game.id, game);
    return game;
  }

  createQuestions(settings: Setting) {
    let questions = [];
    for (let i = 0; i < settings.questionCount; i++) {
      questions.push(this.questionService.createQuestion(settings));
    }
    return questions;
  }

  start(user: User, game: Game) {
    if (game.questions.length === 0) {
      throw new Error('Questions have not been initialized');
    }
    console.log('Welcome: '+user.username);
    game.questions.forEach((question) => {
      let questionString = this.questionService.print(question);
      console.log(questionString);
    });
  }
}

export { GameService };
