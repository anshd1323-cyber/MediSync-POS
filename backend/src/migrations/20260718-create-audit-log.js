'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the old table if it exists (for sqlite/legacy)
    await queryInterface.dropTable('audit_logs');
    
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      clinic_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM('DISPENSED_CONTROLLED', 'VOIDED_INVOICE', 'STOCK_ADJUSTMENT'),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  }
};
