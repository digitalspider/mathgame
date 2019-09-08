import Container, { Service, Inject } from 'typedi';
import { Setting } from '../model/Setting';
import { User } from '../model/User';
import { SettingService } from './SettingService';
import { NotFoundError } from 'routing-controllers';

@Service()
class UserService {

  constructor(
    private settingService: SettingService,
    private users = new Map<string, User>(),
  ) {
  }

  createUser(username: string, settings?: Setting): User {
    if (!settings) {
      settings = this.settingService.createSetting();
    }
    let user = new User(username, settings);
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

export { UserService }