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
      'merchant_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        default: null,
      }
    )
    await queryInterface.addColumn(
      'orders',
      'payment_method',
      {
        type: Sequelize.STRING,
        allowNull: true,
        default: null,
      }
    );
    await queryInterface.addColumn(
      'orders',
      'payment_fee',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        default: 0,
      }
    );

    await queryInterface.addColumn(
      'orders',
      'promo_code',
      {
        type: Sequelize.STRING,
        allowNull: true,
        default: '',
      }
    );

    await queryInterface.addConstraint('orders', {
      fields: ['merchant_id'],
      type: 'foreign key',
      name: 'fkey_constraint_orders_and_merchants',
      references: { //Required field
        table: 'merchants',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('carts', 'fkey_constraint_orders_and_merchants');
    await queryInterface.removeColumn('orders', 'payment_method');
    await queryInterface.removeColumn('orders', 'payment_fee');
    await queryInterface.removeColumn('orders', 'promo_code');
  }
};
