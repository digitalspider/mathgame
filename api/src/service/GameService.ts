import moment from 'moment-timezone';
import { FindOptions, Op } from 'sequelize';
import Container, { Service } from 'typedi';
import uuid from 'uuid/v4';
import { Difficulty } from '../model/Difficulty';
import { Game } from '../model/Game.model';
import { Setting } from '../model/Setting';
import { User } from '../model/User.model';
import { QuestionService } from '../service/QuestionService';
import { UserService } from './UserService';
import { SlackService } from './SlackService';

const TZ_AUD_SYD = 'Australia/Sydney';

@Service()
class GameService {

  constructor(
    private questionService: QuestionService = Container.get(QuestionService),
    private userService: UserService = Container.get(UserService),
    private slackService = Container.get(SlackService),
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
   * @param limit limit the result set
   * @param raw if true return raw sequelize content 
   */
  async findGamesByUser(user: User, limit: number = 10, raw: boolean = true): Promise<Game[]> {
    let options: FindOptions = {};
    options.raw = raw;
    options.where = {
      username: user.username,
      settings: {
        difficulty: user.settings.difficulty,
      }
    };
    options.order = [['createdAt', 'DESC']];
    options.limit = limit;
    let games = await Game.findAll(options);
    this.formatGames(games);
    return games;
  }

  /**
   * Count the games that a user has played
   * @param user the user whose games to find
   */
  async countGamesByUser(user: User): Promise<number> {
    let options: FindOptions = {};
    options.where = {
      username: user.username,
    };
    return Game.count(options);
  }

  /**
   * Find the current active game for the user
   * @param user the user whose game to find
   * @param ip the current ip address of the user
   * @param games the list of games this user has
   */
  async findActiveGame(user: User, ip: string, games?: Game[]) {
    if (!games) {
      games = await this.findGamesByUser(user);
    }
    return games.find((game) => game.ip === ip && !game.endTime);
  }

  /**
   * Find the completed games for the user
   * @param user the user whose game to find
   * @param games the list of games this user has
   */
  async findCompletedGame(user: User, games?: Game[]) {
    if (!games) {
      games = await this.findGamesByUser(user);
    }
    return games.filter((game) => game.endTime);
  }


  /**
   * Find the fastest completed games
   * @param limit limit the result set
   * @param frequency frequency of best games
   * @param raw if true return raw sequelize content
   */
  async findBestGames(user: User, limit: number = 10, frequency?: string, raw: boolean = false) {
    let options: FindOptions = {};
    const isGuest = this.userService.isGuest(user);
    let usernameOptions = isGuest ? 'guest' : {[Op.ne]: 'guest'};
    let frequencyOptions: object = {[Op.not]: null};
    if (frequency) {
      switch(frequency) {
        case 'daily':
          frequencyOptions = {[Op.between]: [moment().startOf('day'),moment().endOf('day')]};
          break;
        case 'weekly':
          frequencyOptions = {[Op.between]: [moment().startOf('week'),moment().endOf('week')]};
          break;
        case 'monthly':
          frequencyOptions = {[Op.between]: [moment().startOf('month'),moment().endOf('month')]};
          break;
      }
    }
    options.where = {
      endTime: {[Op.ne]: null},
      speed: {[Op.gt]: 0},
      settings: {
        difficulty: user.settings.difficulty,
      },
      username: usernameOptions,
      createdAt: frequencyOptions,
    };
    options.include = [{model: User, as: 'user'}],
    options.order = [['speed', 'ASC']];
    options.limit = limit;
    options.raw = raw;
    let games = await Game.findAll(options);
    this.formatGames(games);
    return games;
  }

  /**
   * Create a new game and populate teh questions.
   * @param user the user the game belongs to
   * @param ip the ip address of the request for this game
   */
  async createGame(user: User, ip: string): Promise<Game> {
    let questions = this.createQuestions(user.settings);
    let game = Game.build({id: uuid(), user, username: user.username, settings: user.settings, questions, ip});
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
   * @param user the user playing the game
   * @param game the game being played
   */
  async stop(user: User, game: Game): Promise<Game> {
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
      let penatlyInSeconds = 3;
      switch (game.settings.difficulty) {
        case Difficulty.MEDIUM: penatlyInSeconds = 4; break;
        case Difficulty.HARD: penatlyInSeconds = 5; break;
        case Difficulty.CUSTOM: penatlyInSeconds = 5; break;
      }
      game.durationInMs += penatlyInSeconds * 1000 * game.errors; // Add 3s penalty
      let errorString = 'error';
      if (game.errors>1) { errorString = 'errors' }
      game.errorMessage = `Well done, but you made ${game.errors} ${errorString}, with ${penatlyInSeconds}s penalty per error`;
    } else {
      game.goodMessage = `Well done: ${game.username}. Perfect score!<i class="fa fa-check mathicon" id="perfect-score"></i>`;
    }
    game.speed = Math.floor(game.durationInMs / game.questions.length);
    this.calculateDisplay(game);
    if (!this.userService.isGuest(user)) {
      if (user.fastestSpeed === 0 || game.speed < user.fastestSpeed) {
        user.fastestSpeed = game.speed;
        game.goodMessage += `<br/>Congratulations. A new fastest speed of ${game.speed/1000}s <i class="fa fa-fighter-jet mathicon" id="fastest-speed"></i>`;
      }
      if (!user.points) { user.points = 0; }
      user.points += this.calculatePoints(game);
      const newLevel = this.calculateLevel(user.points);
      if (newLevel > user.level) {
        user.level = newLevel;
        game.goodMessage += `<br/>Congratulations. <b>New Level!</b> You are now level <span class="badge badge-primary">${user.level}</span>
          <span class="badge badge-primary"><i class="fa fa-trophy mathicon" id="new-level"></i></span>`;
      }
      await this.userService.updateUser(user);
    }
    const result = this.updateGame(game);
    // Asynchronously send slack notification
    this.slackService.sendMessage(`New game completed. User=${user.username}, Speed=${game.speed}`);
    return result;
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

  calculatePoints(game: Game) {
    let points = 0;
    points += game.score;
    switch(game.settings.difficulty) {
      case Difficulty.MEDIUM:
        points += game.score;
        break;
      case Difficulty.HARD:
        points += game.score;
        points += game.score;
        break;
    }
    return points;
  }

  calculateLevel(points: number = 0) {
    let level = 0;
    switch(true) {
      case (points < 25): level = 0; break;
      case (points < 50): level = 1; break;
      case (points < 75): level = 2; break;
      case (points < 150): level = 3; break;
      case (points < 250): level = 4; break;
      case (points < 500): level = 5; break;
      case (points < 1000): level = 6; break;
      case (points < 2500): level = 7; break;
      case (points < 5000): level = 8; break;
      case (points < 10000): level = 9; break;
      case (points < 25000): level = 10; break;
      default: level = 11;
    }
    return level;
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
    if (typeof game.speed === 'string') {
      game.speed = parseInt(game.speed);
    }
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

  formatGames(games: Game[], timezone: string = TZ_AUD_SYD) {
    games.map((game) => this.formatGame(game));
  }

  formatGame(game: Game, timezone: string = TZ_AUD_SYD) {
    if (game.endTime) game.displayTime = moment(game.endTime).tz(timezone).format('DD MMM YYYY @ HH:mm');
    if (game.durationInMs) {
      game.displayDuration = moment.duration(game.durationInMs, 'ms').asSeconds().toString();
    }
    game.displaySpeed = moment.duration(game.speed, 'ms').asSeconds().toString();
  }
}

export { GameService };

