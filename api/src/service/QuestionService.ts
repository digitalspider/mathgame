import { Service } from 'typedi';
import { Operation } from '../model/Operation';
import { Question } from '../model/Question';
import { Setting } from '../model/Setting';

@Service()
class QuestionService {
  /**
   * Get a number between 0 and val (inclusive)
   * @param val maximum value of the random number
   */
  random(val: number) {
    return Math.floor(Math.random() * (val+1));
  }

  /**
   * Create a new questions with the maxValue(s) and operation
   * determined by the settings.
   * @param settings the settings to apply
   */
  createQuestion(settings: Setting): Question {
    let firstNumber = this.random(settings.maxValue);
    let secondNumber = this.random(settings.maxValue);
    let operation = settings.operations[0];
    if (settings.operations.length>1) {
      let operationIndex = Math.floor(Math.random() * settings.operations.length);
      operation = settings.operations[operationIndex];
    }

    if (operation === Operation.SUBTRACT) {
      while (secondNumber > firstNumber) {
        firstNumber = this.random(settings.maxValue);
        secondNumber = this.random(firstNumber);
      }
    } else if (operation === Operation.DIVIDE) {
      while (firstNumber % secondNumber !== 0) {
        firstNumber = this.random(settings.maxValue);
        secondNumber = this.random(firstNumber);
      }
    }
    let question = new Question(firstNumber, secondNumber, operation);
    return question;
  }

  /**
   * return the "firstNumber operation secondNumber" separated by spaces
   * @param question the question to print
   */
  print(question: Question) {
    return [question.firstNumber, question.operation, question.secondNumber].join(' ');
  }

  /**
   * Set the value of userAnswer in the question, and calculate isCorrect.
   * @param question the question
   * @param answer the answer
   */
  setAnswer(question: Question, answer: number) {
    question.userAnswer = answer;
    question.isCorrect = question.userAnswer === question.correctAnswer;
  }
}

export { QuestionService };
