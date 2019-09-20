import bcrypt from 'bcryptjs';
import Container, { Service } from 'typedi';
import { Setting } from '../model/Setting';
import User from '../model/User.model';
import { SettingService } from './SettingService';
import { sequelize } from '../db';
import Bluebird from 'bluebird';

@Service()
class UserService {

  constructor(
    private settingService: SettingService = Container.get(SettingService),
  ) {
  }

  async createUser(username: string, password: string, email: string, settings?: Setting): Promise<User> {
    let existingUser = await this.getUserRaw(username);
    if (existingUser) {
      throw new Error('This username is already registered');
    }
    if (!settings) {
      settings = this.settingService.createSetting();
    }
    let salt = await bcrypt.genSalt(10);
	  let hash = await bcrypt.hash(password, salt);
    let user = new User();
    user.username = username;
    user.password = hash;
    user.email = email;
    user.settings = settings;
    return user.save();
  }

  async getUser(username: string): Promise<User> {
    let user: any = await sequelize.models.User.findByPk(username);
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  async getUserRaw(username: string): Promise<User | null> {
    return await User.findByPk(username);
  }

  updateUser(user: User): User {
    // validate that user exists
    let dbUser = this.getUser(user.username);
    let updatedUser = Object.assign(dbUser, user);
    // TODO: Save user
    // this.users.set(user.username, Object.assign({}, updatedUser));
    delete updatedUser.password;
    return updatedUser;
  }
}

export { UserService };

