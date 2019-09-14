import Container, {Service} from 'typedi';
import {Game} from '../model/Game';
import {Setting} from '../model/Setting';
import {User} from '../model/User';
import {QuestionService} from '../service/QuestionService';

@Service()
class GameService {

  games: Map<number,Game>;
  constructor(
    private questionService: QuestionService = Container.get(QuestionService),
  ) {
    this.games = new Map<number,Game>(); // Cache of games
  }

  /**
   * Get an existing game, by it's id
   * @param id the id of the game
   * @param user the user the game belongs to
   */
  getGame(id: number, user: User) {
    let game = this.games.get(id);
    if (!game) {
      throw new Error(`Game ${id} does not exist`);
    }
    if (game && game.user.username !== user.username) {
      throw new Error(`Game ${id} does not belong to ${user.username}`);
    }
    return game;
  }

  /**
   * Find all the games that belong to this user
   * @param user the user whose games to find
   */
  findGamesByUser(user: User) {
    return Array.from<Game>(this.games.values()).filter((game) => game.user.username === user.username);
  }

  /**
   * Find the current active game for the user
   * @param user the user whose game to find
   * @param games the list of games this user has
   */
  findActiveGame(user: User, games?: Game[]) {
    if (!games) {
      games = this.findGamesByUser(user);
    }
    return games.find((game) => !game.endTime);
  }

  /**
   * Find the completed games for the user
   * @param user the user whose game to find
   * @param games the list of games this user has
   */
  findCompletedGame(user: User, games?: Game[]) {
    if (!games) {
      games = this.findGamesByUser(user);
    }
    return games.filter((game) => game.endTime);
  }

  /**
   * Create a new game and populate teh questions.
   * @param user the user the game belongs to
   */
  createGame(user: User) {
    let questions = this.createQuestions(user.settings);
    let game = new Game(this.games.size, user, user.settings, questions);
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
  start(game: Game) {
    if (game.questions.length === 0) {
      throw new Error(`Game ${game.id} questions have not been initialized`);
    }
    game.questions.forEach((question) => {
      let questionString = this.questionService.print(question);
      console.log(questionString);
    });
    game.startTime = new Date();
  }

  /**
   * Stop the game, creating the endTime, calculating the duration,
   * scoring and updating the game.
   * @param game the game being played
   */
  stop(game: Game) {
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
    return this.updateGame(game);
  }

  /**
   * Persist the game to the "games" cache
   * @param game the game being played
   */
  updateGame(game: Game) {
    this.games.set(game.id, game);
    return game;
  }

  /**
   * Calculate the game score and error properties based on the
   * number of correct questions.
   * Calls questionService.setAnswer() to determine if answer is correct
   * @param game the game with a set of questions
   */
  calculateScore(game: Game) {
    game.questions.forEach((question) => {
      if (question.userAnswer) {
        this.questionService.setAnswer(question, question.userAnswer);
      }
      if (question.isCorrect) {
        game.score++;
      } else {
        game.errors++;
      }
    });
  }

  deserialize(game: Game) {
    if (typeof game.id === 'string') {
      game.id = parseInt(game.id);
    }
    if (typeof game.settings.questionCount === 'string') {
      game.settings.questionCount = parseInt(game.settings.questionCount);
    }
    if (typeof game.settings.maxValue === 'string') {
      game.settings.maxValue = parseInt(game.settings.maxValue);
    }
    if (typeof game.settings.avgSecondsPerQuestion === 'string') {
      game.settings.avgSecondsPerQuestion = parseInt(game.settings.avgSecondsPerQuestion);
    }
  }
}

export {GameService};

