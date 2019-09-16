import bcrypt from 'bcryptjs';
import Container, {Service} from 'typedi';
import {Setting} from '../model/Setting';
import {User} from '../model/User';
import {SettingService} from './SettingService';
import {Difficulty} from '../model/Difficulty';
import {Operation} from '../model/Operation';

@Service()
class UserService {

  constructor(
    private settingService: SettingService = Container.get(SettingService),
    private users = new Map<string, User>(),
  ) {
    let settings = this.settingService.createSetting(Difficulty.KINDY, [Operation.ADD, Operation.SUBTRACT]);
    settings.questionCount = 5;
    this.createUser('guest','guest', 'guest@mathgame.com.au', settings);
  }

  async createUser(username: string, password: string, email: string, settings?: Setting): Promise<User> {
    let existingUser = this.getUserRaw(username);
    if (existingUser) {
      throw new Error('This username is already registered');
    }
    if (!settings) {
      settings = this.settingService.createSetting();
    }
    let salt = await bcrypt.genSalt(10);
	  let hash = await bcrypt.hash(password, salt);
    let user = new User(username, hash, email, settings);
    this.users.set(username, user);
    return user;
  }

  getUser(username: string): User {
    let user = this.users.get(username);
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  getUserRaw(username: string): User | undefined {
    return this.users.get(username);
  }

  updateUser(user: User): User {
    // validate that user exists
    let dbUser = this.getUser(user.username);
    let updatedUser = Object.assign(dbUser, user);
    this.users.set(user.username, Object.assign({}, updatedUser));
    delete updatedUser.password;
    return updatedUser;
  }
}

export {UserService};

