import { FindOptions } from 'sequelize/types';
import { Service } from 'typedi';
import { Country } from '../model/Country.model';
import { School } from '../model/School.model';
import { State } from '../model/State.model';
import { InterfaceKeyValue } from '../model/InterfaceKeyValue';

const TYPE_COUNTRY = 'Country';
const TYPE_STATE = 'State';
const TYPE_SCHOOL = 'School';

@Service()
class LookupService {
  async get(type: string = TYPE_COUNTRY, key: string) {
    switch (type) {
      case TYPE_COUNTRY:
        return this.getCountry(key); break;
      case TYPE_STATE:
        return this.getState(key); break;
      case TYPE_SCHOOL:
        return this.getSchool(key); break;
      default:
        throw new Error(`Invalid type ${type} for LookupService.get(). key=${key}`);
    }
  }

  async getAll(type: string = TYPE_COUNTRY, query?: string) {
    switch (type) {
      case TYPE_COUNTRY:
        return this.getAllCountry(query); break;
      case TYPE_STATE:
        return this.getAllState(query); break;
      case TYPE_SCHOOL:
        return this.getAllSchool(query); break;
      default:
        throw new Error(`Invalid type ${type} for LookupService.getAll()`);
    }
  }

  async create(type: string = TYPE_COUNTRY, data: InterfaceKeyValue) {
    switch (type) {
      case TYPE_COUNTRY:
        return this.createCountry(data as Country); break;
      case TYPE_STATE:
        return this.createState(data as State); break;
      case TYPE_SCHOOL:
        return this.createSchool(data as School); break;
      default:
        throw new Error(`Invalid type ${type} for LookupService.create()`);
    }
  }

  async delete(type: string = TYPE_COUNTRY, key: string) {
    switch (type) {
      case TYPE_COUNTRY:
        return this.deleteCountry(key); break;
      case TYPE_STATE:
        return this.deleteState(key); break;
      case TYPE_SCHOOL:
        return this.deleteSchool(key); break;
      default:
        throw new Error(`Invalid type ${type} for LookupService.create()`);
    }
  }

  async getCountry(key: string): Promise<Country | null> {
    return Country.findByPk(key);
  }

  async getState(key: string): Promise<State | null> {
    return State.findByPk(key);
  }

  async getSchool(key: string): Promise<School | null> {
    return School.findByPk(key);
  }

  async getAllCountry(query?: string, raw: boolean = true): Promise<Country[]> {
    let options: FindOptions = { raw };
    if (query) { options.where = {value: query}; }
    return Country.findAll(options);
  }

  async getAllState(query?: string, raw: boolean = true): Promise<State[]> {
    let options: FindOptions = { raw };
    if (query) { options.where = {value: query}; }
    return State.findAll(options);
  }

  async getAllSchool(query?: string, raw: boolean = true): Promise<School[]> {
    let options: FindOptions = { raw };
    if (query) { options.where = {value: query}; }
    return School.findAll(options);
  }

  async createCountry(data: Country): Promise<Country> {
    let result = Country.build(data);
    return result.save();
  }

  async createState(data: State): Promise<State> {
    let result = State.build(data);
    return result.save();
  }

  async createSchool(data: School): Promise<School> {
    let result = School.build(data);
    return result.save();
  }

  async deleteCountry(key: string): Promise<number> {
    return Country.destroy({where: {key}});
  }

  async deleteState(key: string): Promise<number> {
    return State.destroy({where: {key}});
  }

  async deleteSchool(key: string): Promise<number> {
    return School.destroy({where: {key}});
  }
}

export { LookupService };

