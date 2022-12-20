'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('schedule_calls', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      schedule_call: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      product_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 2,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      product_info: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
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
    await queryInterface.dropTable('schedule_calls');
  }
};
