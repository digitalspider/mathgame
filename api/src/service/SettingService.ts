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
    let setting = new Setting(difficulty, operations, questionCount, customMax, customAvgSecondsPerQuestion);
    if (difficulty!=Difficulty.CUSTOM) {
      this.setDifficulty(setting, difficulty);
    }
    return setting;
  }

  setDifficulty(setting: Setting, difficulty: Difficulty) {
    switch(difficulty) {
      case Difficulty.KINDY: setting.maxValue=6; setting.avgSecondsPerQuestion=10; break;
      case Difficulty.EASY: setting.maxValue=12; setting.avgSecondsPerQuestion=6; break;
      case Difficulty.MEDIUM: setting.maxValue=20; setting.avgSecondsPerQuestion=3; break;
      case Difficulty.HARD: setting.maxValue=100; setting.avgSecondsPerQuestion=2; break;
      case Difficulty.CUSTOM: break; 
      default:
        throw new Error('Invalid difficulty input = '+difficulty);
    }
  }

  /**
   * Get a list of settings available
   * @param user the user logged in
   */
  getAllSettings(user?: User) {
    return {
      difficulty: [
        Difficulty.KINDY,
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
