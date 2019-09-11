import { SettingService } from '../../service/SettingService';
import {Request, Response, NextFunction} from 'express';
import Container from 'typedi';

const settingService = Container.get(SettingService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let settings = settingService.getAllSettings();
  return res.json(settings);
}
