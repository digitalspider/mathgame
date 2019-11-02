import { NextFunction, Request, Response } from 'express';
import { check, sanitize, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import Container from 'typedi';
import uuid from 'uuid/v4';
import { JWT_SECRET, MATHGAME_COOKIE } from '../config';
import { User } from '../model/User.model';
import { GameService } from '../service/GameService';
import { LookupService } from '../service/LookupService';
import { UserService } from '../service/UserService';
import { ValidationService } from '../service/ValidationService';

const userService = Container.get(UserService);
const gameService = Container.get(GameService);
const lookupService = Container.get(LookupService);
const validationService = Container.get(ValidationService);

export const index = async (req: Request, res: Response) => {
  let user: User = req.user as User;
  let {isGuest, settingOptions} = res.locals;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '';
  let userGames = await gameService.findGamesByUser(user);
  let game = await gameService.findActiveGame(user, ip.toString(), userGames);
  let completedGames = await gameService.findCompletedGame(user, userGames);
  res.render("index", {
      title: "Home",
      user,
      isGuest,
      completedGames,
      game,
      settingOptions,
  });
};

export const login = async(req: Request, res: Response) => {
  // Autologin via cookie
  const authCookie = req.cookies[MATHGAME_COOKIE];
  if (authCookie) {
    try {
      const accessToken = jwt.verify(authCookie, JWT_SECRET);
      if (accessToken && typeof accessToken==='object' && Object.keys(accessToken).includes('token')) {
        const user = await userService.findUserByAccessToken((accessToken as any).token);
        if (user) {
          if ((accessToken as any).username === user.username) {
            return req.logIn(user, (err) => {
              if (!err) res.redirect("/");
            });
          }
        }
      }
    } catch(err) {
      console.error(`Could not authenticate with cookie. ${err}`);
    }
  }
  res.render("login", {
    success_msg: 'You can login as guest / guest <div class="btn btn-success" id="btn-login" onclick="javascript:loginAsGuest()">Login as Guest</div>',
  });
};

export const register = (req: Request, res: Response) => {
  res.render("register");
};

export const logout = (req: Request, res: Response) => {
  let user: User = req.user as User;
  if (!userService.isGuest(user)) {
    res.clearCookie(MATHGAME_COOKIE);
  }
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
};

export const profile = async(req: Request, res: Response) => {
  let user: User = req.user as User;
  let {username} = req.params;
  let {isGuest, settingOptions} = res.locals;
  let params = {}
  if (!isGuest && username) {
    let player = await userService.findUserByUsername(username, true);
    const games = await gameService.countGamesByUser(player);
    player.settings = user.settings;
    params = {
      user: player,
      isGuest,
      settingOptions,
      view: true,
      games,
      isSelf: false,
    }
  }
  else {
    const games = await gameService.countGamesByUser(user);
    const country = await lookupService.getAllCountry();
    const state = await lookupService.getAllState();
    const school = await lookupService.getAllSchool();
    country.forEach((item) => {
      if (user.countryId && item.key === user.countryId) item.selected = true;
    });
    state.forEach((item) => {
      if (user.stateId && item.key === user.stateId) item.selected = true;
    });
    school.forEach((item) => {
      if (user.schoolId && item.key === user.schoolId) item.selected = true;
    });
    const view = !req.path.includes('/edit');
    params = {
      user,
      isGuest,
      settingOptions,
      country,
      state,
      school,
      view,
      games,
      isSelf: true,
      success_msg: isGuest ? 'Please <a href="/register">register</a> a user to use this page' : null,
      helpers: {
        toLowerCase: function(input: string) {
          return input && input.toLowerCase();
        }
      }
    };
  }
  res.render("profile", params);
};

export const leaderboard = async (req: Request, res: Response) => {
  let user: User = req.user as User;
  let {frequency} = req.params;
  let {isGuest, settingOptions} = res.locals;
  let bestGames = await gameService.findBestGames(user, 10, frequency, false);
  res.render("leaderboard", {
    user,
    isGuest,
    bestGames,
    settingOptions,
    path: req.path,
    success_msg: isGuest ? 'Please <a href="/register">register</a> a user to use this page' : null,
    helpers: {
      ifEq: function(elem: string, input: string, options: any) {
        if(input === elem) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifContainsStr: function(elem: string, input: string, options: any) {
        if(elem.includes(input)) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      toLowerCase: function(input: string) {
        return input && input.toLowerCase();
      },
    },
  });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  check("email", "Email is not valid").isEmail();
  check("password", "Password cannot be blank").isLength({min: 1});
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      req.flash("error_msg", errors.array().toString());
      return res.redirect("/login");
  }

  passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
      if (err) { return next(err); }
      if (!user) {
          req.flash("error_msg", info.message);
          return res.redirect("/login");
      }
      if (!userService.isGuest(user)) {
        createJwtToken(user, res);
      }
      req.logIn(user, (err) => {
          if (err) { return next(err); }
          req.flash("success_msg", "Success! You are logged in.");
          res.redirect(req.session && req.session.returnTo || "/");
      });
  })(req, res, next);
};

function createJwtToken(user: User, res: Response) {
  user.accessToken = uuid();
  const token = jwt.sign({
    username: user.username,
    token: user.accessToken,
  }, JWT_SECRET, { expiresIn: '7d' });
  userService.updateUser(user);
  res.cookie(MATHGAME_COOKIE, token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
}

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {username, password, email} = req.body;
    validationService.validateInput(username, 'username');
    validationService.validateInput(password, 'password');
    validationService.validateInput(email, 'email');
    let user = await userService.createUser(username, password, email);
    if (!user) {
      throw new Error('Could not register user: '+username)
    }
    postLogin(req, res, next);
  } catch(err) {
    req.flash('error_msg', err.message);
    res.redirect('/register');
  }
}
