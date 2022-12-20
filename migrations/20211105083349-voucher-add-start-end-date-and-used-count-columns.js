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
      'vouchers',
      'start_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.addColumn(
      'vouchers',
      'end_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.addColumn(
      'vouchers',
      'used_count',
      {
        type: Sequelize.INTEGER,
        allowNull: null,
        defaultValue: null,
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
    await queryInterface.removeColumn('vouchers', 'start_date');
    await queryInterface.removeColumn('vouchers', 'end_date');
    await queryInterface.removeColumn('vouchers', 'used_count');
  }
};
