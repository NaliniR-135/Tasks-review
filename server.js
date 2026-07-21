require('dotenv').config();
const express = require('express');
const { init, processQueue } = require('./rabbitmq-tasks/app');
const { seedQueue } = require('./rabbitmq-tasks/pro');

const PORT = process.env.PORT;
const POLL_EVERY = Number(process.env.POLL_EVERY);//everything from env comes as string so we use number so that the setInterval needs a number not a string

async function start() {
  await init();
  await seedQueue();

  setInterval(processQueue, POLL_EVERY);
  console.log(`Server polling every ${POLL_EVERY / 1000}s`);

  const app = express();
  app.get('/', (_req, res) => res.json({ status: 'ok' }));
  app.listen(PORT, () => console.log(`Server is on http://localhost:${PORT}`));
}

start().catch(err => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});