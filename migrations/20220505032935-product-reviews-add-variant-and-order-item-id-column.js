'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'product_reviews',
      'variant',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }
    );

    await queryInterface.addColumn(
      'product_reviews',
      'order_item_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('product_reviews', 'variant');
    await queryInterface.removeColumn('product_reviews', 'order_item_id');
  }
};
