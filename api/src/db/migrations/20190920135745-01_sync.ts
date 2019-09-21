'use strict';

import { sequelize } from '../index';

module.exports = {
  up: (queryInterface: any, Sequelize: any) => {
    console.log(sequelize.models);
    return sequelize.sync({
      force: true,
    });
  },

  down: (queryInterface: any, Sequelize: any) => {
    console.log(sequelize.models);
    return new Promise((resolve, reject) => {
      Object.values(sequelize.models).forEach((model: any) => {
        return queryInterface.dropTable(model.tableName);
      });
      resolve(true);
    });
  }
};
