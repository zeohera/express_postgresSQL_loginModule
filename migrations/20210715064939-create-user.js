"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
        require: true,
      },
      lastName: {
        type: Sequelize.STRING,
        require: true,
      },
      email: {
        type: Sequelize.STRING,
        require: true,
      },
      avatar: {
        type: Sequelize.STRING,
        require: true,
      },
      username: {
        type: Sequelize.STRING,
        require: true,
      },
      password: {
        type: Sequelize.STRING,
        require: true,
      },
      billing: {
        type: Sequelize.BOOLEAN,
        require: true,
      },
      userPermission: {
        type: Sequelize.STRING,
        require: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
  },
};
