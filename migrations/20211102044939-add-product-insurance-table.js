'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('products_insurance', {
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
      service_value: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 5000,
      },
      message_text_popup: {
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
    await queryInterface.dropTable('products_insurance');
  }
};
