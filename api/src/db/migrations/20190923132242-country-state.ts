'use strict';

import { QueryInterface, Sequelize, Op } from "sequelize";
import { sequelize } from "..";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    const promises: Promise<object>[] = [];
    const {Country, State} = sequelize.models;
    const now = new Date();
    promises.push(
      queryInterface.bulkInsert(Country.tableName, [
        {key: 'AU', value: 'Australia', createdAt: now, updatedAt: now},
        {key: 'USA', value: 'America', createdAt: now, updatedAt: now},
        {key: 'NZ', value: 'New Zealand', createdAt: now, updatedAt: now},
        {key: 'UK', value: 'United Kingdom', createdAt: now, updatedAt: now},
        {key: 'IND', value: 'India', createdAt: now, updatedAt: now},
        {key: 'CH', value: 'China', createdAt: now, updatedAt: now},
        {key: 'FR', value: 'France', createdAt: now, updatedAt: now},
        {key: 'GR', value: 'Germany', createdAt: now, updatedAt: now},
        {key: 'SP', value: 'Spain', createdAt: now, updatedAt: now},
        {key: 'OTHER', value: 'Other', createdAt: now, updatedAt: now},
      ])
    );
    promises.push(
      queryInterface.bulkInsert(State.tableName, [
        {key: 'NSW', value: 'New South Wales', createdAt: now, updatedAt: now},
        {key: 'QLD', value: 'Queensland', createdAt: now, updatedAt: now},
        {key: 'SA', value: 'South Australia', createdAt: now, updatedAt: now},
        {key: 'WA', value: 'Western Australia', createdAt: now, updatedAt: now},
        {key: 'NT', value: 'Northern Territory', createdAt: now, updatedAt: now},
        {key: 'VIC', value: 'Victoria', createdAt: now, updatedAt: now},
        {key: 'TAS', value: 'Tasmaina', createdAt: now, updatedAt: now},
        {key: 'OTHER', value: 'Other', createdAt: now, updatedAt: now},
      ])
    );
    return Promise.all(promises);
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    const promises: Promise<object>[] = [];
    const {Country, State} = sequelize.models;
    promises.push(
      queryInterface.bulkDelete(Country.tableName, {key: {[Op.in]: ['AU','NZ','USA','UK','FR','IND','CH']}}),
      queryInterface.bulkDelete(State.tableName, {key: {[Op.in]: ['NSW','QLD','SA','WA','NT','VIC','TAS']}})
    );
    return Promise.all(promises);
  }
};
