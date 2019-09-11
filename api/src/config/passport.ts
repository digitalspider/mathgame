import passport from "passport";
import passportLocal, {IVerifyOptions} from "passport-local";
import bcrypt from 'bcryptjs';
import {User} from '../model/User';
import {UserService} from '../service/UserService';
import Container from 'typedi';
import {NextFunction, Request, Response} from 'express';
import { check, sanitize, validationResult } from "express-validator";

const LocalStrategy = passportLocal.Strategy;

const userService: UserService = Container.get(UserService);

passport.serializeUser<any, any>((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username: string, done: Function) => {
  try {
    let user = userService.getUser(username);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(function(username: string, password: string, done: Function) {
    // Match user
    try {
      let user = userService.getUserRaw(username);
      console.log('passport found '+JSON.stringify(user));
      if (!user) {
        return done(null, false, { message: 'That username '+username+' is not registered' });
      }

      // Match password
      bcrypt.compare(password, user.password, (err: any, isMatch: boolean) => {
        if (err) throw err;
        if (!isMatch) {
          return done(null, false, { message: 'Password incorrect' });
        }
        return done(null, user);
      });
    } catch(err) {
      return done(null, false, { message: 'Authentication error for username: '+username+'. '+err });
    };
  })
);

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  /*
  check("email", "Email is not valid").isEmail();
  check("password", "Password cannot be blank").isLength({min: 1});
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      req.flash("errors", errors.array());
      return res.redirect("/login");
  }
  */

  console.log("about to passport authenticate");
  passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
      console.log("inside passport authenticate");
      if (err) { return next(err); }
      if (!user) {
          req.flash("errors", info.message);
          return res.redirect("/login");
      }
      req.logIn(user, (err) => {
          if (err) { return next(err); }
          req.flash("success", "Success! You are logged in.");
          req.user = user;
          res.redirect(req.session && req.session.returnTo || "/");
      });
  })(req, res, next);
};

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  let user = await userService.createUser(req.body.username, req.body.password);
  if (!user) {
    return res.redirect('/register');
  }
  console.log('/registered user='+JSON.stringify(user));
  postLogin(req, res, next);
}