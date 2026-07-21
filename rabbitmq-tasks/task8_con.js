const amqp = require('amqplib');
const axios = require('axios');

const QUEUE_NAME = 'govuk-urls';

async function processUrl(url) {
  const { data: html } = await axios.get(url);
}

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  console.log('Pulling URLs one by one...');

  let processedCount = 0;

  while (true) {
    const msg = await channel.get(QUEUE_NAME, { noAck: false });

    if (msg === false) {
      console.log('Queue is empty');
      break;
    }

    const url = msg.content.toString();
    console.log(`Processing: ${url}`);

    try {
      await processUrl(url);
      channel.ack(msg);
      processedCount++;
    } catch (err) {
      console.error(`-> failed: ${err.message}`);
      channel.ack(msg);
    }
  }

  console.log(`Done, processed ${processedCount} URLs`);

  await channel.close();
  await connection.close();
}

main().catch(console.error);