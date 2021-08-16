/* eslint-disable arrow-body-style */
/* eslint-disable strict */
// eslint-disable-next-line lines-around-directive
'use strict';

module.exports = {
  // eslint-disable-next-line no-unused-vars
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
    return queryInterface.bulkInsert('roles', [
      {
        name: 'owner',
        description: 'project owner',
      },
      {
        name: 'admin',
        description: 'project admin',
      },
      {
        name: 'member',
        description: 'project member',
      },
      {
        name: 'guest',
        description: 'project guest',
      },
      {
        name: 'invited',
        description: 'invited person',
      },
    ]);
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Roles', null, {});
  },

};
