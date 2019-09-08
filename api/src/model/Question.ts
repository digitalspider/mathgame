import {Operation} from './Operation';
import {Setting} from './Setting';

class Question {
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;

  constructor(public firstNumber: number,public secondNumber: number,public operation: Operation) {
    this.correctAnswer = this.calculateAnswer();
  }

  calculateAnswer() {
    switch (this.operation) {
      case Operation.ADD:
        return this.firstNumber + this.secondNumber;
      case Operation.SUBTRACT:
        return this.firstNumber - this.secondNumber;
      case Operation.MULTIPLY:
        return this.firstNumber * this.secondNumber;
      case Operation.DIVIDE:
        return this.firstNumber / this.secondNumber;
      default:
        throw new Error('Invalid operation: ' + this.operation);
    }
  }
}

export { Question };