'use strict';

import { QueryInterface, Sequelize } from "sequelize";
import Container from "typedi";
import { sequelize } from "..";
import { UserService } from "../../service/UserService";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return Container.get(UserService).createUser('guest', 'guest', 'guest@mathgame.com.au');
  },

  down: async(queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.delete(new sequelize.models.Game(), sequelize.models.Game.tableName, {username: 'guest'});
    return queryInterface.delete(new sequelize.models.User(), sequelize.models.User.tableName, {username: 'guest'});
  }
};
