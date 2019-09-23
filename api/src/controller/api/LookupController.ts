import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { LookupService } from '../../service/LookupService';

const lookupService = Container.get(LookupService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  const {type, key} = req.params;
  const data = lookupService.get(type, key);
  return res.json(data);
}

export const all = (req: Request, res: Response, next: NextFunction) => {
  const {type} = req.params;
  const data = lookupService.getAll(type);
  return res.json(data);
}

export const find = (req: Request, res: Response, next: NextFunction) => {
  const {type, query} = req.params;
  const data = lookupService.getAll(type, query);
  return res.json(data);
}

export const create = (req: Request, res: Response, next: NextFunction) => {
  const {type} = req.params;
  const data = lookupService.create(type, req.body);
  return res.json(data);
}

export const remove = (req: Request, res: Response, next: NextFunction) => {
  const {type, key} = req.params;
  const data = lookupService.delete(type, key);
  return res.json(data);
}

