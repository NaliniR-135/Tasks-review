require('dotenv').config();
const amqp = require('amqplib');

const MAIN_URL = 'https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest';
const QUEUE = process.env.QUEUE_NAME;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

async function seedQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  // durable: true -- queue survives a RabbitMQ restart
  await channel.assertQueue(QUEUE, { durable: true });

  // persistent: true -- message itself is written to disk, not just the queue
  channel.sendToQueue(QUEUE, Buffer.from(MAIN_URL), { persistent: true });
  console.log('seed pushed to queue:', MAIN_URL);

  await channel.close();
  await connection.close();
}

module.exports = { seedQueue, MAIN_URL };