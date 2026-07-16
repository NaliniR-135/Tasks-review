const amqp = require('amqplib');

const QUEUE_NAME = 'purge-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  const result = await channel.purgeQueue(QUEUE_NAME);
  console.log(`Purged '${QUEUE_NAME}'. Queue is now empty.`, result);
  console.log('Check the UI: Ready should now show 0.');

  await channel.close();
  await connection.close();
}

main().catch(console.error);