'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'user_addresses',
      'latitude',
      {
        type: Sequelize.STRING,
        allowNull: false,
        default: 0,
      }
    );

    await queryInterface.addColumn(
      'user_addresses',
      'longitude',
      {
        type: Sequelize.STRING,
        allowNull: false,
        default: 0,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('user_addresses', 'latitude');
    await queryInterface.removeColumn('user_addresses', 'longitude');
  }
};
