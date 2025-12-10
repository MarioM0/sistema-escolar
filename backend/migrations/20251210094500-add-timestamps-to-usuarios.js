export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("usuarios", "created_at", {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  });
  await queryInterface.addColumn("usuarios", "updated_at", {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("usuarios", "created_at");
  await queryInterface.removeColumn("usuarios", "updated_at");
}
