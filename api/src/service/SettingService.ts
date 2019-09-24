import {Service} from 'typedi';
import {Difficulty} from '../model/Difficulty';
import {Operation} from '../model/Operation';
import {Setting} from '../model/Setting';
import {User} from '../model/User.model';

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
    difficulty: Difficulty = Difficulty.KINDY,
    operations: Operation[] = [Operation.ADD],
    questionCount: number = 5,
    customMax: number = 6,
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
      case Difficulty.KINDY: setting.questionCount=5; setting.maxValue=6; setting.avgSecondsPerQuestion=10; break;
      case Difficulty.EASY: setting.questionCount=10; setting.maxValue=12; setting.avgSecondsPerQuestion=6; break;
      case Difficulty.MEDIUM: setting.questionCount=10; setting.maxValue=20; setting.avgSecondsPerQuestion=3; break;
      case Difficulty.HARD: setting.questionCount=10; setting.maxValue=100; setting.avgSecondsPerQuestion=2; break;
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
    let result = {
      difficulty: [
        {name: Difficulty.KINDY, active: false},
        {name: Difficulty.EASY, active: false},
        {name: Difficulty.MEDIUM, active: false},
        {name: Difficulty.HARD, active: false},
        {name: Difficulty.CUSTOM, active: false},
      ],
      operations: [
        {name: Operation.ADD, active: false},
        {name: Operation.SUBTRACT, active: false},
        {name: Operation.MULTIPLY, active: false},
        {name: Operation.DIVIDE, active: false},
      ],
      questionCount: [5, 10, 20, 30],
      maxValue: 10,
      avgSecondsPerQuestion: 6,
    };
    if (user) {
      result.difficulty.forEach((value) => {
        if (value.name === user.settings.difficulty) value.active = true;
      });
      result.operations.forEach((value) => {
        if (user.settings.operations.includes(value.name)) value.active = true;
      });
    }
    return result;
  }
}

export {SettingService};
