const { assertBootEnv, env } = require('./config/env');

assertBootEnv();

const app = require('./app');
const { startScheduler } = require('./jobs/scheduler');
const { getOrganization } = require('./services/settings.service');

async function main() {
  await getOrganization();
  startScheduler();
  app.listen(env.port, () => {
    console.log(`CampusHub API listening on port ${env.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
