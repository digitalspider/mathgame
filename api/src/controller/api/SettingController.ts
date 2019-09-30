import { SettingService } from '../../service/SettingService';
import {Request, Response, NextFunction} from 'express';
import Container from 'typedi';
import {User} from '../../model/User.model';
import {UserService} from '../../service/UserService';

const settingService = Container.get(SettingService);
const userService = Container.get(UserService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let settings = settingService.getAllSettings();
  return res.json(settings);
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  settingService.updateSettings(user, settingService.createSetting(
    req.body.difficulty,
    req.body.operations,
    parseInt(req.body.questionCount),
    parseInt(req.body.maxValue)
  ));
  let updatedUser = await userService.updateUser(user);
  return res.json(updatedUser);
}

