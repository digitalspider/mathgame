import { Service } from 'typedi';
import { Operation } from '../model/Operation';
import { Question } from '../model/Question';
import { Setting } from '../model/Setting';

@Service()
class QuestionService {
  random(val: number) {
    return Math.floor(Math.random() * (val+1));
  }

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


  print(question: Question) {
    return question.firstNumber + question.operation + question.secondNumber;
  }


  setAnswer(question: Question, answer: number) {
    question.userAnswer = answer;
    question.isCorrect = question.userAnswer === question.correctAnswer;
  }
}

export { QuestionService };
