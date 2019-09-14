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
    let settings = this.settingService.createSetting();
    settings.questionCount = 3;
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
    this.getUser(user.username);
    this.users.set(user.username, user);
    return user;
  }
}

export {UserService};

