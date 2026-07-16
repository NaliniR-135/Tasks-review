const amqp = require('amqplib');

const QUEUE_NAME = 'durable-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  //durable:true will keep the queue exists even after the restart or crash of rabbitmq
  for (let i = 1; i <= 10; i++) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(`Persistent message ${i}`),{ persistent: true });
    //persistent:true will keep the messages in the queue even after a restart
  }

  console.log('Sent 10 persistent messages to a durable queue.');
  console.log('Now restart RabbitMQ, then run task6_consumer.js to confirm they survived.');

  await channel.close();
  await connection.close();
}

main().catch(console.error);