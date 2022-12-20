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
      'popup_settings',
      'banner_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.addColumn(
      'popup_settings',
      'type',
      {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
      }
    );
    await queryInterface.addColumn(
      'popup_settings',
      'product_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('popup_settings', 'banner_url');
    await queryInterface.removeColumn('popup_settings', 'type');
    await queryInterface.removeColumn('popup_settings', 'product_id');
  }
};
