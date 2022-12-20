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
      'merchants',
      'latitude',
      {
        type: Sequelize.STRING,
        allowNull: false,
        default: 0,
      }
    );

    await queryInterface.addColumn(
      'merchants',
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
    await queryInterface.removeColumn('merchants', 'latitude');
    await queryInterface.removeColumn('merchants', 'longitude');
  }
};
