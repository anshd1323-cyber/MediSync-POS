'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'schedule_class', {
      type: Sequelize.ENUM('OTC', 'H', 'H1', 'X'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'schedule_class');
  }
};
