import { sequelize } from '../src/db.js';

// Set up test database
beforeAll(async () => {
  await sequelize.authenticate();
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  const models = sequelize.models;
  for (const modelName of Object.keys(models)) {
    await models[modelName].destroy({ where: {}, force: true });
  }
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
});
