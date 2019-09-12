import "reflect-metadata";
import {User} from '../../model/User';
import {UserService} from '../../service/UserService';
import Container from 'typedi';
import {Request, Response, NextFunction} from 'express';

const userService: UserService = Container.get(UserService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let result = Object.assign({}, userService.getUser(user.username));
  delete result.password;
  return res.json(result);
}

export const update = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let {username} = user;
  let userInput: User = req.body;
  if (username !== userInput.username) {
    throw new Error(`Cannot change username in update. Username=${username}`);
  }
  let result = Object.assign({}, userService.updateUser(userInput));
  delete result.password;
  return res.json(result);
}
