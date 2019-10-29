import { NextFunction, Request, Response } from 'express';
import "reflect-metadata";
import Container from 'typedi';
import { User } from '../../model/User.model';
import { UserService } from '../../service/UserService';
import { ValidationService } from "../../service/ValidationService";

const userService: UserService = Container.get(UserService);
const validationService: ValidationService = Container.get(ValidationService);

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let result = await userService.getUser(user.username);
  return res.json(result);
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let {username} = user;
  let userInput: User = req.body;
  if (typeof userInput.age === 'string') {
    userInput.age = userInput.age ? parseInt(userInput.age) : 0;
  }
  if (typeof userInput.showAge === 'string') {
    userInput.showAge = userInput.showAge === 'on';
  }
  if (typeof userInput.showEmail === 'string') {
    userInput.showEmail = userInput.showEmail === 'on';
  }
  if (typeof userInput.showSchool === 'string') {
    userInput.showSchool = userInput.showSchool === 'on';
  }
  if (username !== userInput.username) {
    throw new Error(`Cannot change username in update. Username=${username}`);
  }
  validationService.validateInput(userInput.email, 'email');
  validationService.validateInput(userInput.displayName, 'displayName');
  let result = await userService.updateUser(userInput);
  return res.json(result);
}
