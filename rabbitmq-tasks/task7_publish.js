const amqp = require('amqplib');

const QUEUE_NAME = 'purge-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  for (let i = 1; i <= 100; i++) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(`Msg ${i}`));
  }

  console.log("Published 100 messages to 'purge-queue'.");
  console.log('Check the UI: Ready should show 100.');

  await channel.close();
  await connection.close();
}

main().catch(console.error);