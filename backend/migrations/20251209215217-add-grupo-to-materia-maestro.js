'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // First, migrate existing data from materias to materia_maestro
    // Try to get existing materia grupo values; if the column doesn't exist, continue with empty set
    let materiaMaestroRecords = [];
    try {
      materiaMaestroRecords = await queryInterface.sequelize.query(
        `SELECT mm.id, mm.materia_id, m.grupo FROM materia_maestro mm JOIN materias m ON mm.materia_id = m.id`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    } catch (err) {
      console.warn('Could not read grupo from materias; skipping data migration step:', err.message || err);
      materiaMaestroRecords = [];
    }

    // Add grupo column to materia_maestro table (nullable first)
    try {
      await queryInterface.addColumn('materia_maestro', 'grupo', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (err) {
      console.warn('Could not add materia_maestro.grupo (may already exist):', err.message || err);
    }

    // Update existing records with grupo from materia
    for (const record of materiaMaestroRecords) {
      try {
        await queryInterface.sequelize.query(
          `UPDATE materia_maestro SET grupo = ? WHERE id = ?`,
          { replacements: [record.grupo, record.id] }
        );
      } catch (err) {
        console.warn('Could not update materia_maestro record', record.id, err.message || err);
      }
    }

    // Now make grupo not nullable
    try {
      await queryInterface.changeColumn('materia_maestro', 'grupo', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (err) {
      console.warn('Could not change materia_maestro.grupo to not null (may already be not null):', err.message || err);
    }

    // Remove grupo and maestro_id columns from materias table if they exist
    try {
      await queryInterface.removeColumn('materias', 'grupo');
    } catch (err) {
      console.warn('Could not remove materias.grupo (may not exist):', err.message || err);
    }

    try {
      await queryInterface.removeColumn('materias', 'maestro_id');
    } catch (err) {
      console.warn('Could not remove materias.maestro_id (may not exist):', err.message || err);
    }
  },

  async down (queryInterface, Sequelize) {
    // Add back grupo column to materias table
    try {
      await queryInterface.addColumn('materias', 'grupo', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (err) {
      console.warn('Could not add materias.grupo during down migration:', err.message || err);
    }

    // Add back maestro_id column to materias table
    try {
      await queryInterface.addColumn('materias', 'maestro_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      });
    } catch (err) {
      console.warn('Could not add materias.maestro_id during down migration:', err.message || err);
    }

    // Migrate data back from materia_maestro to materias
    const materiaMaestroRecords = await queryInterface.sequelize.query(
      `SELECT DISTINCT materia_id, grupo FROM materia_maestro`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const record of materiaMaestroRecords) {
      await queryInterface.sequelize.query(
        `UPDATE materias SET grupo = ? WHERE id = ?`,
        { replacements: [record.grupo, record.materia_id] }
      );
    }

    // Remove grupo column from materia_maestro table
    await queryInterface.removeColumn('materia_maestro', 'grupo');
  }
};
