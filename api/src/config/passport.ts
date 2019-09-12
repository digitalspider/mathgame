import bcrypt from 'bcryptjs';
import passport from "passport";
import passportLocal from "passport-local";
import Container from 'typedi';
import {UserService} from '../service/UserService';
import {Request, Response, NextFunction} from 'express';
import {find} from 'lodash';

const LocalStrategy = passportLocal.Strategy;

const userService: UserService = Container.get(UserService);

passport.serializeUser<any, any>((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username: string, done: Function) => {
  try {
    let user = Object.assign({}, userService.getUser(username));
    delete user.password;
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
        return done(null, false, { message: 'The username '+username+' is not registered' });
      }
      if (!user.password) {
        return done(null, false, { message: 'The username '+username+' has no password' });
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

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/login");
};

/**
* Authorization Required middleware.
*/
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  /*
  if (req.user && find(req.user.tokens, { kind: provider })) {
      next();
  } else {
      res.redirect(`/auth/${provider}`);
  }
  */
};
