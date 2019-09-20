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
      Object.keys(sequelize.models).map((model: string) => {
        return queryInterface.dropTable(model);
      });
      resolve(true);
    });
  }
};
