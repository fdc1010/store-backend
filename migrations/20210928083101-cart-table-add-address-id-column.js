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
      'carts',
      'address_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        default: null,
      }
    );

    await queryInterface.addConstraint('carts', {
      fields: ['address_id'],
      type: 'foreign key',
      name: 'fkey_constraint_carts_and_user_address',
      references: { //Required field
        table: 'user_addresses',
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
    await queryInterface.removeConstraint('carts', 'fkey_constraint_carts_and_user_address');
    await queryInterface.removeColumn('carts', 'address_id');
  }
};
