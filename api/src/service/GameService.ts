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
    if (game && game.user !== user) {
      throw new Error(`Game ${id} does not belong to ${user.username}`);
    }
    return game;
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
      throw new BadRequestError(`Game ${game.id} questions have not been initialized`);
    }
    game.questions.forEach((question) => {
      let questionString = this.questionService.print(question);
      console.log(questionString);
    });
    game.startTime = new Date();
    console.log('startTime='+game.startTime);
  }

  /**
   * Stop the game, creating the endTime, calculating the duration,
   * scoring and updating the game.
   * @param game the game being played
   */
  stop(game: Game) {
    if (!game.startTime) {
      throw new BadRequestError(`Game ${game.id} has not started`);
    }
    game.endTime = new Date();
    console.log('endTime='+game.endTime);
    game.durationInMs = game.endTime.getTime()-game.startTime.getTime();
    console.log('duration='+game.durationInMs);
    this.calculateScore(game);
    console.log('score='+game.score+', errors='+game.errors);
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
}

export {GameService};

