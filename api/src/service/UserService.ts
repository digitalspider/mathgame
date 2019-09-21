import bcrypt from 'bcryptjs';
import Container, { Service } from 'typedi';
import { Setting } from '../model/Setting';
import { User } from '../model/User.model';
import { SettingService } from './SettingService';

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
    let user = User.build({username, password: hash, email, settings});
    return user.save();
  }


  async getUser(username: string): Promise<User> {
    let user = await User.findByPk(username, {attributes: {exclude: ['password']}});
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  async getUserRaw(username: string): Promise<User | null> {
    return await User.findByPk(username);
  }

  async getUserByEmail(email: string): Promise<User> {
    let user = await User.findOne<User>({where: {email: email}, attributes: {exclude: ['password']}});
    if (!user) {
      throw new Error('User with email '+email+' does not exist');
    }
    return user;
  }

  async updateUser(user: User): Promise<User> {
    // validate that user exists
    let dbUser = await this.getUser(user.username);
    let updatedUser = Object.assign({}, await dbUser.update({email: user.email, settings: user.settings}));
    delete updatedUser.password;
    return updatedUser;
  }
}

export { UserService };

