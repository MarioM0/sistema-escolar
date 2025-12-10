'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // First, migrate existing data from materias to materia_maestro
    // Get all existing materia_maestro records and their corresponding materia grupo
    const materiaMaestroRecords = await queryInterface.sequelize.query(
      `SELECT mm.id, mm.materia_id, m.grupo FROM materia_maestro mm JOIN materias m ON mm.materia_id = m.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Add grupo column to materia_maestro table (nullable first)
    await queryInterface.addColumn('materia_maestro', 'grupo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Update existing records with grupo from materia
    for (const record of materiaMaestroRecords) {
      await queryInterface.sequelize.query(
        `UPDATE materia_maestro SET grupo = ? WHERE id = ?`,
        { replacements: [record.grupo, record.id] }
      );
    }

    // Now make grupo not nullable
    await queryInterface.changeColumn('materia_maestro', 'grupo', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Remove grupo column from materias table
    await queryInterface.removeColumn('materias', 'grupo');

    // Remove maestro_id column from materias table
    await queryInterface.removeColumn('materias', 'maestro_id');
  },

  async down (queryInterface, Sequelize) {
    // Add back grupo column to materias table
    await queryInterface.addColumn('materias', 'grupo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add back maestro_id column to materias table
    await queryInterface.addColumn('materias', 'maestro_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    });

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
