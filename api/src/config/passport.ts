import bcrypt from 'bcryptjs';
import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import Container from 'typedi';
import { GOOGLE_CB_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '.';
import { User } from '../model/User.model';
import { UserService } from '../service/UserService';
import { Request } from 'express';

const userService: UserService = Container.get(UserService);

passport.serializeUser<any, any>((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username: string, done: Function) => {
  try {
    let authUser = Object.assign({}, await userService.getUser(username, true));
    delete authUser.password;
    done(null, authUser);
  } catch (err) {
    done(err, null);
  }
});

// thanks to https://github.com/passport/todos-express-google
// thanks to https://dev.to/samippoudel/google-oauth-using-typescript-expressjs-passportjs-mongodb-5el8
async function verifyFederatedCredentials(req: Request, accessToken: string, refreshToken: string,  profile: Profile, done: VerifyCallback) {
  // note: accessToken and refresh token allows for calling Google APIs to update user data. Not required.
  console.log('google profile', { profile });
  const { id, displayName, emails } = profile || {};
  const username = displayName;
  const email = emails?.[0].value || '';
  try {
    const existingUser: User|null = await userService.findUserByGoogleId(id);
    if (existingUser) return done(null, existingUser);
    const user = await userService.getUserRaw(username);
    if (!user) {
      const newUser = await userService.createUser(username, '', email, undefined, id);
      if (!newUser) throw new Error(`Could not create a new user: ${username} for federated google account`);
      return done(null, newUser);
    }
    user.googleId = id;
    await user.save();
    return done(null, user);
  } catch (e) {
    console.error('Failed to authenticate with google', { username, id, email }, e );
    return done(e);
  }
}

async function verifyLocalPassword(username: string, password: string, done: Function) {
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
}

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CB_URL,
  scope: [ 'email', 'profile' ],
  passReqToCallback: true,
}, verifyFederatedCredentials));

passport.use(new LocalStrategy(verifyLocalPassword));
