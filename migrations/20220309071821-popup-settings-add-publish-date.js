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
      'publish_date_from',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: new Date(),
      }
    );

    await queryInterface.addColumn(
      'popup_settings',
      'publish_date_to',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: new Date(),
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
    await queryInterface.removeColumn('popup_settings', 'publish_date_from');
    await queryInterface.removeColumn('popup_settings', 'publish_date_to');
  }
};
