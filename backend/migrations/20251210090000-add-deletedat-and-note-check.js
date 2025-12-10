"use strict";

export default {
  async up(queryInterface, Sequelize) {
    // Add deleted_at column for soft deletes
    try {
      await queryInterface.addColumn('calificaciones', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (err) {
      console.warn('Could not add calificaciones.deleted_at (may already exist):', err.message || err);
    }

    // Add CHECK constraint to ensure nota is between 0 and 100 or NULL
    // Using raw SQL because Sequelize does not have a portable check-constraint helper
    const sql = `ALTER TABLE calificaciones ADD CONSTRAINT check_nota_range CHECK (nota IS NULL OR (nota >= 0 AND nota <= 100));`;
    try {
      await queryInterface.sequelize.query(sql);
    } catch (err) {
      console.warn('Could not add check constraint check_nota_range (may already exist):', err.message || err);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove CHECK constraint and deleted_at column
    // Drop constraint
    try {
      await queryInterface.sequelize.query('ALTER TABLE calificaciones DROP CONSTRAINT IF EXISTS check_nota_range;');
    } catch (err) {
      // ignore
    }

    try {
      await queryInterface.removeColumn('calificaciones', 'deleted_at');
    } catch (err) {
      console.warn('Could not remove calificaciones.deleted_at (may not exist):', err.message || err);
    }
  }
};
