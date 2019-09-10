import bcrypt from 'bcryptjs';
import {NotFoundError} from 'routing-controllers';
import {Service} from 'typedi';
import {Setting} from '../model/Setting';
import {User} from '../model/User';
import {SettingService} from './SettingService';

@Service()
class UserService {

  constructor(
    private settingService: SettingService,
    private users = new Map<string, User>(),
  ) {
  }

  async createUser(username: string, password: string, settings?: Setting): Promise<User> {
    if (!settings) {
      settings = this.settingService.createSetting();
    }
    let salt = await bcrypt.genSalt(10);
	  let hash = await bcrypt.hash(password, salt);
    let user = new User(username, hash, settings);
    this.users.set(username, user);
    return user;
  }

  getUser(username: string): User {
    let user = this.users.get(username);
    if (!user) {
      throw new NotFoundError('Username '+username+' does not exist');
    }
    return user;
  }

  updateUser(user: User): User {
    // validate that user exists
    this.getUser(user.username);
    this.users.set(user.username, user);
    return user;
  }
}

export {UserService};

