'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      clinic_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      care_episode_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      consultation_id: {
        type: Sequelize.INTEGER,
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
      status: {
        type: Sequelize.ENUM('DRAFT', 'SIGNED', 'PARTIALLY_DISPENSED', 'DISPENSED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      signed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      signature_hash: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('prescriptions');
  }
};
