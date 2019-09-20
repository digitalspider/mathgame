import {NextFunction, Request, Response} from 'express';
import "reflect-metadata";
import Container from 'typedi';
import {Game} from '../../model/Game';
import User from '../../model/User.model';
import {GameService} from '../../service/GameService';

const gameService = Container.get(GameService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let game = gameService.getGame(req.params.id, user);
  return res.json(game);
}

export const list = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let result = gameService.findGamesByUser(user);
  return res.json(result);
}

export const create = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let game = gameService.createGame(user);
  return res.json(game);
}

export const update = (req: Request, res: Response, next: NextFunction) => {
  let gameInput: Game = req.body;
  let user: User = req.user && Object.assign(req.user);
  gameService.getGame(gameInput.id, user); // validate correct game
  let result = gameService.updateGame(gameInput);
  return res.json(result);
}

export const start = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user && Object.assign(req.user);
  let gameId = req.params.id;
  let game = gameService.getGame(gameId, user); // validate correct game
  gameService.start(game);
  return res.json(game);
}

export const stop = (req: Request, res: Response, next: NextFunction) => {
  let gameId = req.params.id;
  let gameInput = req.body;
  if (gameInput.id != gameId) {
    throw new Error(`Invalid game.id provided: ${gameInput.id}!=${gameId}`);
  }
  let user: User = req.user && Object.assign(req.user);
  let game = gameService.getGame(gameId, user); // validate correct game
  gameService.stop(gameInput);
  return res.json(game);
}
