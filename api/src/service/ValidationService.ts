import fs from 'fs';
import path from 'path';
import { Service } from 'typedi';

@Service()
class ValidationService {
  // https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
  badWords: string[];

  constructor() {
    this.badWords = fs.readFileSync(path.join(__dirname, '../config/invalidWords.txt'), 'UTF-8').split('/n');
  }

  validateInput(input: string, fieldName?: string): void {
    this.badWords.forEach((badWord) => {
      if (input.includes(badWord)) {
        let message = 'Invalid input provided';
        message += fieldName ? ` for field ${fieldName}` : '';
        throw new Error(message);
      }
    });
  }
}

export { ValidationService };

