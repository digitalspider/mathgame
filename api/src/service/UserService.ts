import bcrypt from 'bcryptjs';
import Container, { Service } from 'typedi';
import { Setting } from '../model/Setting';
import { User } from '../model/User.model';
import { SettingService } from './SettingService';
import { FindOptions } from 'sequelize/types';

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


  async getUser(username: string, raw: boolean = false): Promise<User> {
    let options: FindOptions = {};
    options.raw = raw;
    options.attributes = {exclude: ['password']};
    let user = await User.findByPk(username, options);
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  async getUserRaw(username: string): Promise<User | null> {
    return User.findByPk(username);
  }

  async findUserByEmail(email: string): Promise<User> {
    let user = await User.findOne<User>({where: {email: email}, attributes: {exclude: ['password']}});
    if (!user) {
      throw new Error('User with email '+email+' does not exist');
    }
    return user;
  }

  async findUserByUsername(username: string, raw: boolean = false): Promise<User> {
    let options: FindOptions = {};
    options.raw = raw;
    options.attributes = ['username','fastestSpeed','level','points','displayName','country','state'];
    let user = await User.findByPk(username, options);
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  async findUserByAccessToken(accessToken: string): Promise<User | null> {
    return User.findOne<User>({where: {accessToken: accessToken}, attributes: ['username']});
  }

  async updateUser(user: User): Promise<User> {
    // validate that user exists
    let dbUser = await this.getUser(user.username);
    let updatedUser = Object.assign({}, await dbUser.update({
      email: user.email,
      settings: user.settings,
      displayName: user.displayName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      fastestSpeed: user.fastestSpeed,
      age: user.age,
      level: user.level,
      points: user.points,
      country: user.country,
      state: user.state,
      school: user.school,
      showAge: user.showAge,
      showEmail: user.showEmail,
      showSchoool: user.showSchool,
    }));
    delete updatedUser.password;
    return updatedUser;
  }

  isGuest(user: User): boolean {
    return user && user.username === 'guest';
  }

  isAdmin(user: User): boolean {
    return user && user.username === 'admin';
  }
}

export { UserService };

