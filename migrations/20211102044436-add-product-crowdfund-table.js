'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('products_crowdfund', {
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
      merchant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      is_going_crowd_funding: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      service_value: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 5000,
      },
      above_service_value_not_going_message: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      },
      above_service_value_going_message: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      },
      below_service_value_not_going_message: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
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
    await queryInterface.dropTable('products_crowdfund');
  }
};
