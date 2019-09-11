import "reflect-metadata";
import {User} from '../../model/User';
import {UserService} from '../../service/UserService';
import Container from 'typedi';
import {Request, Response, NextFunction} from 'express';

const userService: UserService = Container.get(UserService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let user = userService.getUser(req.params.username);
  delete user.password;
  return res.json(user);
}

export const update = (req: Request, res: Response, next: NextFunction) => {
  let {username} = req.params;
  let user: User = req.body;
  if (username !== user.username) {
    throw new Error(`Cannot change username in update. Username=${username}`);
  }
  let updatedUser = userService.updateUser(user);
  delete updatedUser.password;
  return res.json(updatedUser);
}
