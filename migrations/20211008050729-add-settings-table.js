'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('settings', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      values: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{}',
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 1,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('settings');
  }
};
