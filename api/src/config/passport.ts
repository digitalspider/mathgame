import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import passport from "passport";
import passportLocal from "passport-local";
import Container from 'typedi';
import { UserService } from '../service/UserService';

const LocalStrategy = passportLocal.Strategy;

const userService: UserService = Container.get(UserService);

passport.serializeUser<any, any>((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username: string, done: Function) => {
  try {
    const user = await userService.getUser(username);
    const authUser = {
      username: user.username,
      email: user.email,
      settings: user.settings,
    };
    done(null, authUser);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(async function(username: string, password: string, done: Function) {
    // Match user
    try {
      let user = await userService.getUserRaw(username);
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
