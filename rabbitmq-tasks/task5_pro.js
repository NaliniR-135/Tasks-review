const amqp = require('amqplib');

const QUEUE_NAME = 'competing-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  for (let i = 1; i <= 30; i++) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(`Task ${i}`));
  }

  console.log('Published 30 messages');
  await channel.close();
  await connection.close();
}

main().catch(console.error);