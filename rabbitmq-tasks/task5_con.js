const amqp = require('amqplib');
const crypto = require('crypto');

const QUEUE_NAME = 'competing-queue';
const CONSUMER_NAME = `Consumer-${crypto.randomBytes(2).toString('hex')}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  
  console.log(`${CONSUMER_NAME} waiting for messages. CTRL+C to stop.`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      console.log(` [${CONSUMER_NAME}] Received: ${msg.content.toString()}`);
      await sleep(300); 
      channel.ack(msg);
    }
  });
}

main().catch(console.error);