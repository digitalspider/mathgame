import bcrypt from 'bcryptjs';
import { FindOptions } from 'sequelize/types';
import Container, { Service } from 'typedi';
import { Setting } from '../model/Setting';
import { User } from '../model/User.model';
import { SettingService } from './SettingService';
import { SlackService } from './SlackService';

@Service()
class UserService {

  constructor(
    private settingService = Container.get(SettingService),
    private slackService = Container.get(SlackService),
  ) {
  }

  async createUser(username: string, password: string, email: string, settings?: Setting, data?: Partial<User>): Promise<User> {
    const { googleId, googleProfile } = data || {};
    const existingUser = await this.getUserRaw(username);
    if (existingUser) {
      throw new Error('This username is already registered');
    }
    if (!settings) {
      settings = this.settingService.createSetting();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    let user = User.build({username, password: hash, email, settings, displayName: username, googleId, googleProfile });
    const result = user.save();
    // Asynchronously send slack notification
    this.slackService.sendMessage(`New user registered: ${user.username}`);
    return result;
  }


  async getUser(username: string, raw: boolean = false): Promise<User> {
    const options: FindOptions = {};
    options.raw = raw;
    options.attributes = {exclude: ['password']};
    const user = await User.findByPk(username, options);
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
    const options: FindOptions = {};
    options.raw = raw;
    options.attributes = ['username','fastestSpeed','level','points','displayName','countryId','stateId'];
    const user = await User.findByPk(username, options);
    if (!user) {
      throw new Error('Username '+username+' does not exist');
    }
    return user;
  }

  async findUserByGoogleId(googleId: string): Promise<User|null> {
    const options: FindOptions = { where: {googleId} };
    options.attributes = ['username','fastestSpeed','level','points','displayName','countryId','stateId'];
    return User.findOne<User>(options);
  }

  async findUserByAccessToken(accessToken: string): Promise<User|null> {
    return User.findOne<User>({where: {accessToken: accessToken}, attributes: ['username']});
  }

  async updateUser(user: User): Promise<User> {
    // validate that user exists
    let dbUser = await this.getUser(user.username);
    await dbUser.update({
      email: user.email,
      settings: user.settings,
      displayName: user.displayName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      fastestSpeed: user.fastestSpeed,
      age: user.age,
      level: user.level,
      points: user.points,
      countryId: user.countryId,
      stateId: user.stateId,
      schoolId: user.schoolId,
      showAge: user.showAge,
      showEmail: user.showEmail,
      showSchoool: user.showSchool,
    });
    return this.getUser(user.username, true);
  }

  isGuest(user: User): boolean {
    return user && user.username === 'guest';
  }

  isAdmin(user: User): boolean {
    return user && user.username === 'admin';
  }
}

export { UserService };

