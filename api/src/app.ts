import bodyParser from "body-parser";
import flash from "connect-flash";
import express, {NextFunction, Request, Response} from 'express';
import hbs from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import "reflect-metadata";
import {PORT, SESSION_SECRET} from './config';
import * as passportConfig from "./config/passport";
import * as gameController from "./controller/api/GameController";
import * as settingController from "./controller/api/SettingController";
import * as userController from "./controller/api/UserController";
import * as indexController from "./controller/IndexController";
import {Difficulty} from './model/Difficulty';
import {Operation} from './model/Operation';
import {GameService} from './service/GameService';
import {QuestionService} from './service/QuestionService';
import {SettingService} from './service/SettingService';
import {UserService} from './service/UserService';

console.log('START');

// Passport configuration
passportConfig;

const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Express session
app.use(
  session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    /*
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
    */
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next();
  };
  // After successful login, redirect back to the intended page
  if (!req.user &&
  req.path !== "/login" &&
  req.path !== "/register" &&
  !req.path.match(/^\/auth/) &&
  !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
  req.path == "/account") {
      req.session.returnTo = req.path;
  }
  next();
});


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
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// public routes
app.get('/login', indexController.login);
app.get('/register', indexController.register);
app.get('/logout', indexController.logout);
app.post('/login', indexController.postLogin);
app.post('/register', indexController.postRegister);

// Authenticated routes
app.use(passportConfig.isAuthenticated);
app.get('/', indexController.index);
app.get('/api/game/:id', gameController.get);
app.get('/api/game', gameController.list);
app.post('/api/game', gameController.create);
app.post('/api/game/:id/start', gameController.start);
app.post('/api/game/:id/stop', gameController.stop);
app.post('/api/game/:id', gameController.update);
app.get('/api/settings', settingController.get);
app.get('/api/user', userController.get);
app.put('/api/user', userController.update);

/*
app.get('/', (req, res) => {
  res.send('hello');
});
*/

// Set Port
app.set('port', PORT);
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
userService.createUser('admin', 'admin', 'admin@test.com').then((user) => {
  user.settings = settings;
  let game = gameService.createGame(user);
  gameService.start(game);
  console.log('DONE');
});
