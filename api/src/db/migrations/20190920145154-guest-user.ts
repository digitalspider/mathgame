'use strict';

import { sequelize } from '../index';
import { Sequelize, QueryInterface } from "sequelize/types";
import { UserService } from "../../service/UserService";
import Container from "typedi";

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return await Container.get(UserService).createUser('guest', 'guest', 'guest@mathgame.com.au');
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.delete(new sequelize.models.User(), 'user', {username: 'guest'});
  }
};