import moment from 'moment';
import { FindOptions, Op } from 'sequelize';
import Container, { Service } from 'typedi';
import uuid from 'uuid/v4';
import { Game } from '../model/Game.model';
import { Setting } from '../model/Setting';
import { User } from '../model/User.model';
import { QuestionService } from '../service/QuestionService';
import { UserService } from './UserService';

const penatlyInSeconds = 3;

@Service()
class GameService {

  constructor(
    private questionService: QuestionService = Container.get(QuestionService),
    private userService: UserService = Container.get(UserService),
  ) {
  }

  /**
   * Get an existing game, by it's id
   * @param id the id of the game
   * @param user the user the game belongs to
   */
  async getGame(id: string, user: User) {
    let game = await Game.findByPk(id);
    if (!game) {
      throw new Error(`Game ${id} does not exist`);
    }
    if (game && game.username !== user.username) {
      throw new Error(`Game ${id} does not belong to ${user.username}`);
    }
    return game;
  }

  /**
   * Find all the games that belong to this user
   * @param user the user whose games to find
   * @param raw if true return raw sequelize content 
   */
  async findGamesByUser(user: User, raw: boolean = false): Promise<Game[]> {
    let options: FindOptions = {};
    options.raw = raw;
    options.where = {
      username: user.username,
      settings: {
        difficulty: user.settings.difficulty,
      }
    };
    options.order = [['createdAt', 'DESC']];
    options.limit = 10;
    let games = await Game.findAll(options);
    this.formatGames(games);
    return games;
  }

  /**
   * Find the current active game for the user
   * @param user the user whose game to find
   * @param games the list of games this user has
   * @param raw if true return raw sequelize content
   */
  async findActiveGame(user: User, games?: Game[], raw: boolean = false) {
    if (!games) {
      games = await this.findGamesByUser(user, raw);
    }
    return games.find((game) => !game.endTime);
  }

  /**
   * Find the completed games for the user
   * @param user the user whose game to find
   * @param games the list of games this user has
   * @param raw if true return raw sequelize content
   */
  async findCompletedGame(user: User, games?: Game[], raw: boolean = false) {
    if (!games) {
      games = await this.findGamesByUser(user, raw);
    }
    return games.filter((game) => game.endTime);
  }


  /**
   * Find the fastest completed games
   * @param limit limit the result set
   * @param raw if true return raw sequelize content
   */
  async findBestGames(user: User, limit: number = 10, raw: boolean = false) {
    let options: FindOptions = {};
    const isGuest = this.userService.isGuest(user);
    options.where = {
      endTime: {[Op.ne]: null},
      settings: {
        difficulty: user.settings.difficulty,
      }
    };
    if (isGuest) {
      options.where = {
        endTime: {[Op.ne]: null},
        settings: {
          difficulty: user.settings.difficulty,
        },
        username: 'guest',
      };
    }
    options.order = [['durationInMs', 'ASC']];
    options.limit = limit;
    options.raw = raw;
    let games = await Game.findAll(options);
    this.formatGames(games);
    return games;
  }

  /**
   * Create a new game and populate teh questions.
   * @param user the user the game belongs to
   */
  async createGame(user: User): Promise<Game> {
    let questions = this.createQuestions(user.settings);
    let game = Game.build({id: uuid().split('-')[0], user, username: user.username, settings: user.settings, questions});
    return this.updateGame(game);
  }

  /**
   * Create the questions for the game, number determined by settings.questionCount.
   * The difficulty and operations of the questions is set by the settings.
   * @param settings the settings used in creating the questions
   */
  createQuestions(settings: Setting) {
    let questions = [];
    for (let i = 0; i < settings.questionCount; i++) {
      questions.push(this.questionService.createQuestion(settings));
    }
    return questions;
  }

  /**
   * Start the game, by setting the startTime.
   * @param game the game being played
   */
  async start(game: Game): Promise<Game> {
    if (game.questions.length === 0) {
      throw new Error(`Game ${game.id} questions have not been initialized`);
    }
    game.startTime = new Date();
    return this.updateGame(game);
  }

  /**
   * Stop the game, creating the endTime, calculating the duration,
   * scoring and updating the game.
   * @param game the game being played
   */
  async stop(game: Game): Promise<Game> {
    game.endTime = new Date();
    if (!game.startTime) {
      throw new Error(`Game ${game.id} has not started`);
    }
    if (typeof game.startTime === 'string') {
      game.startTime = new Date(game.startTime);
    }
    this.deserialize(game);
    game.durationInMs = game.endTime.getTime()-game.startTime.getTime();
    this.calculateScore(game);
    if (game.errors) {
      game.durationInMs += penatlyInSeconds * 1000 * game.errors; // Add 3s penalty
      let errorString = 'error';
      if (game.errors>1) { errorString = 'errors' }
      game.errorMessage = `Well done, but you made ${game.errors} ${errorString}, with ${penatlyInSeconds}s penalty per error`;
    } else {
      game.goodMessage = `Well done: ${game.username}. Perfect score!`;
    }
    this.calculateDisplay(game);
    return this.updateGame(game);
  }

  /**
   * Persist the game to the "games" cache
   * @param game the game being played
   */
  async updateGame(game: Game): Promise<Game> {
    return game.save();
  }

  /**
   * Calculate the game score and error properties based on the
   * number of correct questions.
   * Calls questionService.setAnswer() to determine if answer is correct
   * @param game the game with a set of questions
   */
  calculateScore(game: Game) {
    game.questions.forEach((question) => {
      if (question.userAnswer || question.userAnswer === 0) {
        this.questionService.setAnswer(question, question.userAnswer);
        game.answered++;
      }
      if (question.isCorrect) {
        game.score++;
      } else {
        game.errors++;
      }
    });
    game.completed = game.questions.length === game.answered;
  }

  /**
   * If there are no errors, set display to success
   * @param game the game to calculate
   */
  calculateDisplay(game: Game): Game {
    game.display = (game.errors===0 ? 'success' : 'warning');
    if (game.score<game.questions.length/2) { game.display='danger'; }
    return game;
  }

  deserialize(game: Game) {
    game.questions.forEach((question) => {
      if (typeof question.firstNumber === 'string') {
        question.firstNumber = parseInt(question.firstNumber);
      }
      if (typeof question.secondNumber === 'string') {
        question.secondNumber = parseInt(question.secondNumber);
      }
      if (typeof question.correctAnswer === 'string') {
        question.correctAnswer = parseInt(question.correctAnswer);
      }
      if (typeof question.userAnswer === 'string') {
        question.userAnswer = parseInt(question.userAnswer);
      }
      if (typeof question.isCorrect === 'string') {
        question.isCorrect = 'true'===question.isCorrect;
      }
    })
  }

  formatGames(games: Game[]) {
    games.map((game) => {
      if (game.endTime) game.displayTime = moment(game.endTime).format('DD MMM YYYY @ HH:mm');
      if (game.durationInMs) {
        game.displayDuration = moment.duration(game.durationInMs, 'ms').asSeconds().toString();
      }
    });
  }
}

export { GameService };

