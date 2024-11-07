'use strict';

import { QueryInterface, Sequelize, Op } from "sequelize";
import { DataType } from "sequelize-typescript";

const TABLE_NAME = 'user';
const COLUMN_NAME = 'googleId';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    const tableDefinition: any = await queryInterface.describeTable(TABLE_NAME);
    if (tableDefinition[COLUMN_NAME]) {
      return Promise.resolve();
    }
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, DataType.STRING);
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
  },
};
