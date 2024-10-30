import bodyParser from "body-parser";
import flash from "connect-flash";
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import hbs from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import https from 'https';
import "reflect-metadata";
import { PORT, SESSION_SECRET, SSL_PORT, SSL_BASE_DIR, SSL_ENABLED } from './config';
import * as passportConfig from "./config/passport";
import * as gameController from "./controller/api/GameController";
import * as settingController from "./controller/api/SettingController";
import * as userController from "./controller/api/UserController";
import * as lookupController from "./controller/api/LookupController";
import * as indexController from "./controller/IndexController";
import { sequelize } from "./db";
import * as auth from "./middleware/auth";

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
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000, dotfiles: 'allow' }));

// Use cookies
app.use(cookieParser());

// Add SSL
let credentials = {};
if (SSL_ENABLED) {
  const privateKey = fs.readFileSync(`${SSL_BASE_DIR}/privkey.pem`, 'utf8');
  const certificate = fs.readFileSync(`${SSL_BASE_DIR}/cert.pem`, 'utf8');
  const ca = fs.readFileSync(`${SSL_BASE_DIR}/chain.pem`, 'utf8');
  credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
}

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
app.use(auth.isAuthenticated);
app.get('/', auth.mainPage, indexController.index);
app.get('/profile', auth.mainPage, indexController.profile);
app.get('/profile/edit', auth.restrictGuest, auth.mainPage, indexController.profile);
app.get('/profile/:username', auth.restrictGuest, auth.mainPage, indexController.profile);
app.get('/leaderboard', auth.mainPage, indexController.leaderboard);
app.get('/leaderboard/:frequency', auth.mainPage, indexController.leaderboard);
app.get('/api/game/:id', gameController.get);
app.get('/api/game', gameController.list);
app.post('/api/game', gameController.create);
app.post('/api/game/:id/start', gameController.start);
app.post('/api/game/:id/stop', gameController.stop);
app.post('/api/game/:id', gameController.update);
app.get('/api/settings', settingController.get);
app.post('/api/settings', settingController.update);
app.get('/api/user', userController.get);
app.put('/api/user', userController.update);
app.post('/api/user', userController.update); // should really use put
app.get('/api/lookup/:type', auth.restrictGuest, lookupController.all);
app.get('/api/lookup/:type/:key', auth.restrictGuest, lookupController.get);
app.get('/api/lookup/:type/find/:query', auth.restrictGuest, lookupController.find);

// Admin only routes
app.use(auth.isAdmin)
// app.get('/profile/:username', userController.adminProfile);
app.post('/api/lookup/:type', lookupController.create);
app.delete('/api/lookup/:type', lookupController.remove);

/*
app.get('/', (req, res) => {
  res.send('hello');
});
*/

// Set Port
app.set('port', PORT);
// Start listening
app.listen(app.get('port'), async function() {
  console.log('Server started on port '+app.get('port'));
  // Synchronize the database
  console.log('Database sync START');
  await sequelize.sync({ logging: true }).then(() => {
    console.log('Database sync DONE');
  });
  console.log('SERVER READY');
});
// SSL Server
if (SSL_ENABLED) {
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(SSL_PORT, function() {
    console.log('Server started on port '+SSL_PORT);
    console.log('DONE');
  });
}
