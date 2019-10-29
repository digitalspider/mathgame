import { NextFunction, Request, Response } from 'express';
import "reflect-metadata";
import Container from 'typedi';
import { Game } from '../../model/Game.model';
import { User } from '../../model/User.model';
import { GameService } from '../../service/GameService';

const gameService = Container.get(GameService);

export const get = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let game = gameService.getGame(req.params.id, user);
  return res.json(game);
}

export const list = (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let result = gameService.findGamesByUser(user);
  return res.json(result);
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let game = await gameService.createGame(user, req.ip);
  return res.json(game);
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  let gameInput: Game = req.body;
  let user: User = req.user as User;
  await gameService.getGame(gameInput.id, user); // validate correct game
  let result = await gameService.updateGame(gameInput);
  return res.json(result);
}

export const start = async (req: Request, res: Response, next: NextFunction) => {
  let user: User = req.user as User;
  let gameId = req.params.id;
  let game = await gameService.getGame(gameId, user); // validate correct game
  game = await gameService.start(game);
  return res.json(game);
}

export const stop = async (req: Request, res: Response, next: NextFunction) => {
  let gameId = req.params.id;
  let gameInput = req.body;
  if (gameInput.id != gameId) {
    throw new Error(`Invalid game.id provided: ${gameInput.id}!=${gameId}`);
  }
  let user: User = req.user as User;
  let game = await gameService.getGame(gameId, user); // validate correct game
  // copy the questions, which contain the answers
  game.questions = Object.assign(game.questions, gameInput.questions);
  game = await gameService.stop(user, game);
  if (game.errorMessage) {
    req.flash('error_msg', game.errorMessage);
  }
  if (game.goodMessage) {
    req.flash('success_msg', game.goodMessage);
  }
  return res.json(game);
}
