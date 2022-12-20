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
      'order_items',
      'setter_price',
      {
        type: Sequelize.FLOAT,
        allowNull: false,
        default: 0,
      }
    );
    await queryInterface.addColumn(
      'order_items',
      'category_fee',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        default: 0,
      }
    );
    await queryInterface.addColumn(
      'order_items',
      'store_fee_amount',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
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
    await queryInterface.removeColumn('order_items', 'store_fee_amount');
    await queryInterface.removeColumn('order_items', 'setter_price');
    await queryInterface.removeColumn('order_items', 'category_fee');
  }
};
