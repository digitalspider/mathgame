import { Difficulty } from './Difficulty';
import { Operation } from './Operation';

class Setting {
  constructor(
    public difficulty: Difficulty = Difficulty.EASY,
    public operations: Operation[] = [Operation.ADD],
    public questionCount: number = 5,
    public minQuestions: number = 0,
    public maxValue: number = 12,
    public avgSecondsPerQuestion: number = 6,
  ) {
  }
}

export { Setting };