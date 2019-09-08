import { Setting } from '../model/Setting';
import { Operation } from '../model/Operation';
import { Difficulty } from '../model/Difficulty';
import { User } from '../model/User';
import { Service } from 'typedi';

@Service()
class SettingService {
  createSetting(
    difficulty: Difficulty = Difficulty.EASY,
    operations: Operation[] = [Operation.ADD],
    questionCount: number = 10,
    customMax: number = 12,
  ): Setting {
    let max;
    switch(difficulty) {
      case Difficulty.EASY: max=12; break;
      case Difficulty.MEDIUM: max=20; break;
      case Difficulty.HARD: max=100; break;
      case Difficulty.CUSTOM: max=customMax; break;
      default:
        throw new Error('Invalid difficulty input = '+difficulty);
    }
    let setting = new Setting(difficulty, operations, questionCount, max);
    return setting;
  }

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
    };
  }
}

export { SettingService }