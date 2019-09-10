import passport from "passport";
import passportLocal from "passport-local";
import bcrypt from 'bcryptjs';
import {User} from '../model/User';
import {UserService} from '../service/UserService';
import Container from 'typedi';

const LocalStrategy = passportLocal.Strategy;

const userService: UserService = Container.get(UserService);

passport.serializeUser<User, string>((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((id: string, done: Function) => {
  try {
    let user = userService.getUser(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy({ usernameField: 'username' }, (username: string, password: string, done: Function) => {
    // Match user
    try {
      console.log('passport looking for '+username);
      let user = userService.getUser(username);
      console.log('passport found '+JSON.stringify(user));
      if (!user) {
        return done(null, false, { message: 'That username is not registered' });
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
      return done(null, false, { message: 'That username is not registered. '+err });
    };
  })
);
