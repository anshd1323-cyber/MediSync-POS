'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('care_episodes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      clinic_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      consultation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      prescription_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('BOOKED', 'IN_CONSULTATION', 'PRESCRIBED', 'BILLING', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'BOOKED',
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
    await queryInterface.dropTable('care_episodes');
  }
};
