const amqp = require('amqplib');

const QUEUE_NAME = 'multi-producer-queue';
const TOTAL = 100;

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  let count = 0;
  console.log('Waiting for 100 messages from A and B...');

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      count++;
      console.log(`(${count}/${TOTAL}) Received: ${msg.content.toString()}`);
      channel.ack(msg);
      if (count >= TOTAL) {
        console.log(`Total received: ${count} messages`);
        await channel.close();
        await connection.close();
      }
    }
  });
}

main().catch(console.error);