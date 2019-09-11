import bodyParser from "body-parser";
import flash from 'connect-flash';
import express from 'express';
import hbs from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import "reflect-metadata";
import {useContainer, useExpressServer} from "routing-controllers";
import Container from 'typedi';
import {IndexController} from './controller/IndexController';
import {Difficulty} from './model/Difficulty';
import {Operation} from './model/Operation';
import {GameService} from './service/GameService';
import {QuestionService} from './service/QuestionService';
import {SettingService} from './service/SettingService';
import {UserService} from './service/UserService';

console.log('START');

// Passport configuration
import * as passportConfig from "./config/passport";

const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/*
// Express Validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);
*/

// Connect flash
app.use(flash());

// Global variables
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });

// its important to set container before any operation you do with routing-controllers,
// including importing controllers
useContainer(Container);

useExpressServer(app, {
  defaultErrorHandler: false,
  controllers: [IndexController]
});

useExpressServer(app, {
  routePrefix: '/api',
  controllers: [__dirname + "/controller/api/*.ts"]
});

app.post('/login', passportConfig.postLogin);
app.post('/register', passportConfig.postRegister);

/*
app.get('/', (req, res) => {
  res.send('hello');
});
*/

// Set Port
app.set('port', process.env.PORT || 5000);
// Start listening
app.listen(app.get('port'), function() {
	console.log('Server started on port '+app.get('port'));
});

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
userService.createUser('david', 'password').then((user) => {
  user.settings = settings;
  let game = gameService.createGame(user);
  gameService.start(game);
  console.log('DONE');
});
