'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Remove the unique constraint on the 'grupo' field in the 'materias' table
    // If the constraint doesn't exist, don't fail the migration
    try {
      await queryInterface.removeConstraint('materias', 'materias_grupo_key');
    } catch (err) {
      // Ignore error if constraint not present
      console.warn('Constraint materias_grupo_key not found or could not be removed:', err.message || err);
    }
  },

  async down (queryInterface, Sequelize) {
    // Add back the unique constraint on the 'grupo' field in the 'materias' table
    await queryInterface.addIndex('materias', ['grupo'], {
      unique: true,
      name: 'materias_grupo_key'
    });
  }
};
