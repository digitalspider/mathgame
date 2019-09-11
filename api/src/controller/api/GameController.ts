import { GameService } from '../../service/GameService';
import { UserService } from '../../service/UserService';
import "reflect-metadata";
import {Game} from '../../model/Game';
import {Request, Response, NextFunction} from 'express';
import Container from 'typedi';

class GameController {

  constructor(
    private gameService: GameService = Container.get(GameService),
    private userService: UserService = Container.get(UserService),
  ) {
  }

  get(req: Request, res: Response, next: NextFunction) {
    let user = this.userService.getUser(req.params.username);
    let game = this.gameService.getGame(parseInt(req.params.id), user);
    return res.json(game);
  }

  create(req: Request, res: Response, next: NextFunction) {
    let user = this.userService.getUser(req.params.username);
    let game = this.gameService.createGame(user);
    return res.json(game);
  }

  start(req: Request, res: Response, next: NextFunction) {
    let user = this.userService.getUser(req.params.username);
    let game = this.gameService.getGame(parseInt(req.params.id), user);
    this.gameService.start(game);
    return res.json(game);
  }

  stop(req: Request, res: Response, next: NextFunction) {
    let game: Game = req.body;
    let user = this.userService.getUser(req.params.username);
    this.gameService.getGame(game.id, user); // validate correct game
    this.gameService.stop(game);
    return res.json(game);
  }
}

export { GameController }
