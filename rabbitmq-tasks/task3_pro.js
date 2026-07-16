const amqp = require('amqplib');

const QUEUE_NAME = 'monitoring-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  for (let i = 1; i <= 100; i++) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(`Msg ${i}`));
  }

  console.log("Published 100 messages to 'monitoring-queue'.");
  console.log('Now open http://localhost:15672 and check Ready / Consumers / Total.');

  await channel.close();
  await connection.close();
}

main().catch(console.error);