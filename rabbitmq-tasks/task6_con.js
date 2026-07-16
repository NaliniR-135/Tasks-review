const amqp = require('amqplib');

const QUEUE_NAME = 'durable-queue';
const TOTAL = 10;

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  let count = 0;
  console.log('Waiting for messages... CTRL+C if none show up (means they were lost).');

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      count++;
      console.log(`Received (survived restart): ${msg.content.toString()}`);
      channel.ack(msg);
      if (count >= TOTAL) {
        console.log(`Total recovered after restart: ${count}/${TOTAL}`);
        await channel.close();
        await connection.close();
      }
    }
  });
}

main().catch(console.error);