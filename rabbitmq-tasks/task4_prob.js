const amqp = require('amqplib');

const QUEUE_NAME = 'multi-producer-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  for (let i = 1; i <= 50; i++) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(`B-${i}`));
  }

  console.log('Producer B sent 50 messages');
  await channel.close();
  await connection.close();
}

main().catch(console.error);