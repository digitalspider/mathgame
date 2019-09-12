import bcrypt from 'bcryptjs';
import Container, {Service} from 'typedi';
import {Setting} from '../model/Setting';
import {User} from '../model/User';
import {SettingService} from './SettingService';

@Service()
class UserService {

  constructor(
    private settingService: SettingService = Container.get(SettingService),
    private users = new Map<string, User>(),
  ) {
    this.createUser('guest','guest', 'guest@mathgame.com.au');
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
    return Object.assign(user);
  }

  getUserRaw(username: string): User | undefined {
    let user = this.users.get(username);
    return user && Object.assign(user) || null;
  }

  updateUser(user: User): User {
    // validate that user exists
    this.getUser(user.username);
    this.users.set(user.username, user);
    return Object.assign(user);
  }
}

export {UserService};

