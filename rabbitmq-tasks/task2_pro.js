const amqp = require('amqplib');

const QUEUE_NAME = 'fifo-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  for (let i = 1; i <= 20; i++) {
    const msg = `Message ${i}`;
    channel.sendToQueue(QUEUE_NAME, Buffer.from(msg));
    console.log(`Sent ${msg}`);
  }

  await channel.close();
  await connection.close();
}

main().catch(console.error);