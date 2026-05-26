require('dotenv').config();
const app = require('./src/app');
const migrate = require('./src/db/migrate');
const seed = require('./src/db/seed');

const PORT = process.env.PORT || 3000;

async function start() {
  await migrate();
  await seed();
  app.listen(PORT, () => console.log(`AgriPartners backend running on port ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
