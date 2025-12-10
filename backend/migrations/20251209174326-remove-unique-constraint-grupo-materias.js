'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Remove the unique constraint on the 'grupo' field in the 'materias' table
    await queryInterface.removeConstraint('materias', 'materias_grupo_key');
  },

  async down (queryInterface, Sequelize) {
    // Add back the unique constraint on the 'grupo' field in the 'materias' table
    await queryInterface.addIndex('materias', ['grupo'], {
      unique: true,
      name: 'materias_grupo_key'
    });
  }
};
