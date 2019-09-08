import { Difficulty } from './Difficulty';
import { Operation } from './Operation';

class Setting {
  constructor(
    public difficulty: Difficulty = Difficulty.EASY,
    public operations: Operation[] = [Operation.ADD],
    public questionCount: number = 10,
    public maxValue: number = 12,
  ) {
  }
}

export { Setting };