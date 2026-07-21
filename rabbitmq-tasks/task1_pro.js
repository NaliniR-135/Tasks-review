const amqp = require('amqplib');

const QUEUE_NAME = 'hello-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME);

  channel.sendToQueue(QUEUE_NAME, Buffer.from('Hello RabbitMQ'));
  console.log("Sent 'Hello RabbitMQ'");

  await channel.close();
  await connection.close();
}

main().catch(console.error);