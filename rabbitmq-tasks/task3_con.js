const amqp = require('amqplib');

const QUEUE_NAME = 'monitoring-queue';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  console.log('Consuming monitoring-queue.. CTRL+C to stop.');

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      console.log(`Received: ${msg.content.toString()}`);
      await sleep(2000); 
      channel.ack(msg);
    }
  });
}

main().catch(console.error);