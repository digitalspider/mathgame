'use strict';

import { QueryInterface, Sequelize, Op } from "sequelize";
import { DataType } from "sequelize-typescript";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.addColumn('game', 'ip', DataType.STRING);
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.removeColumn('game', 'ip');
  },
};
