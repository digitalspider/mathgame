import {Service} from 'typedi';
import {Difficulty} from '../model/Difficulty';
import {Operation} from '../model/Operation';
import {Setting} from '../model/Setting';
import {User} from '../model/User';

@Service()
class SettingService {
  /**
   * Create a settings based on the values provided.
   * @param difficulty level fo difficulty = EASY,MEDIUM,HARD,CUSTOM
   * @param operations available operations = ADD,SUBTRACT,MULTIPLY,DIVIDE
   * @param questionCount the number of questions
   * @param customMax if custom, the maximum value of the questions
   * @param customAvgSecondsPerQuestion if custom, the average seconds per question
   */
  createSetting(
    difficulty: Difficulty = Difficulty.EASY,
    operations: Operation[] = [Operation.ADD],
    questionCount: number = 10,
    customMax: number = 12,
    customAvgSecondsPerQuestion: number = 6,
  ): Setting {
    let max: number;
    let avgSecondsPerQuestion: number;
    switch(difficulty) {
      case Difficulty.EASY: max=12; avgSecondsPerQuestion=6; break;
      case Difficulty.MEDIUM: max=20; avgSecondsPerQuestion=3; break;
      case Difficulty.HARD: max=100; avgSecondsPerQuestion=2; break;
      case Difficulty.CUSTOM: max=customMax; avgSecondsPerQuestion=customAvgSecondsPerQuestion; break;
      default:
        throw new Error('Invalid difficulty input = '+difficulty);
    }
    let setting = new Setting(difficulty, operations, questionCount, max, avgSecondsPerQuestion);
    return setting;
  }

  /**
   * Get a list of settings available
   * @param user the user logged in
   */
  getAllSettings(user?: User) {
    return {
      difficulty: [
        Difficulty.EASY,
        Difficulty.MEDIUM,
        Difficulty.HARD,
        Difficulty.CUSTOM,
      ],
      operations: [
        Operation.ADD,
        Operation.SUBTRACT,
        Operation.MULTIPLY,
        Operation.DIVIDE,
      ],
      questionCount: [10, 20, 30],
      maxValue: 10,
      avgSecondsPerQuestion: 6,
    };
  }
}

export {SettingService};
