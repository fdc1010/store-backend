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
      'orders',
      'delivery_order_ref',
      {
        type: Sequelize.STRING,
        allowNull: true,
        default: null,
      }
    );
    await queryInterface.addColumn(
      'orders',
      'driver_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
        default: null,
      }
    );
    await queryInterface.addColumn(
      'orders',
      'quotation',
      {
        type: Sequelize.TEXT,
        allowNull: true,
        default: null,
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
    await queryInterface.removeColumn('orders', 'delivery_order_ref');
    await queryInterface.removeColumn('orders', 'driver_id');
    await queryInterface.removeColumn('orders', 'quotation');
  }
};
