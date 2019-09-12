import {NextFunction, Request, Response} from 'express';
import {IVerifyOptions} from 'passport-local';
import Container from 'typedi';
import {User} from '../model/User';
import {UserService} from '../service/UserService';
import {GameService} from '../service/GameService';
import passport = require('passport');
import { check, sanitize, validationResult } from "express-validator";

const userService = Container.get(UserService);
const gameService = Container.get(GameService);

export const index = (req: Request, res: Response) => {
  let user: User = req.user && Object.assign(req.user);
  let userGames = gameService.findGamesByUser(user);
  let game = gameService.findActiveGame(user, userGames);
  let completedGames = gameService.findCompletedGame(user, userGames);
  res.render("index", {
      title: "Home",
      user,
      completedGames: completedGames.reverse(),
      game,
  });
};

export const login = (req: Request, res: Response) => {
  res.render("login", {
    success_msg: 'You can login as guest / guest',
  });
};

export const register = (req: Request, res: Response) => {
  res.render("register");
};

export const logout = (req: Request, res: Response) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login')
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

  console.log("about to passport authenticate");
  passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
      console.log("inside passport authenticate");
      if (err) { return next(err); }
      if (!user) {
          req.flash("error_msg", info.message);
          return res.redirect("/login");
      }
      req.logIn(user, (err) => {
          if (err) { return next(err); }
          req.flash("success_msg", "Success! You are logged in.");
          res.redirect(req.session && req.session.returnTo || "/");
      });
  })(req, res, next);
};

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {username, password, email} = req.body;
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
