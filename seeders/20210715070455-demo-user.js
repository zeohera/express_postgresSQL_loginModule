'use strict';

// const { DataTypes } = require('sequelize/types');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    
    await queryInterface.bulkInsert('Users', [
      {
        id: '0',
        firstName: 'Bao',
        lastName: 'Bui',
        email: 'baobc@acaziasoft.com',
        avatar: '',
        username: 'chibao',
        password: '$2b$12$eZyA9zsVymQPDzlIreJUM.rypcV9zHZ5TNo.F2LJvRzECBCVMcqT6',
        billing: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert('userToRoles', [{
      userId: 0,
      roleId: 1,
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});
  },
};
