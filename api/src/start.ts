import bodyParser from "body-parser";
import express from 'express';
import "reflect-metadata";
import { useContainer, useExpressServer } from "routing-controllers";
import Container from 'typedi';
import { GameController } from './controller/GameController';
import { SettingController } from './controller/SettingController';
import { UserController } from './controller/UserController';
import { Difficulty } from './model/Difficulty';
import { Operation } from './model/Operation';
import { GameService } from './service/GameService';
import { QuestionService } from './service/QuestionService';
import { SettingService } from './service/SettingService';
import { UserService } from './service/UserService';

console.log('START');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// its important to set container before any operation you do with routing-controllers,
// including importing controllers
useContainer(Container);

useExpressServer(app, {
  controllers: [UserController, GameController, SettingController]
});
app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(5000, () => {console.log('Server started')});

const settingService = new SettingService();
const questionService = new QuestionService();
const userService = new UserService(settingService);
const gameService = new GameService(questionService);
const difficulty = Difficulty.MEDIUM;
const operations = [Operation.ADD, Operation.SUBTRACT, Operation.MULTIPLY, Operation.DIVIDE];
const questionCount = 20;
let settings = settingService.createSetting(
  difficulty,
  operations,
  questionCount,
);
const user = userService.createUser('david');
user.settings = settings;
let game = gameService.createGame(user);
gameService.start(user, game);
console.log('DONE');