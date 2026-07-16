const amqp = require('amqplib');

const QUEUE_NAME = 'fifo-queue';
const TOTAL = 20;

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  let count = 0;
  console.log('Waiting for 20 messages...');

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      count++;
      console.log(`Received: ${msg.content.toString()}`);
      channel.ack(msg);
      if (count >= TOTAL) {
        console.log(' Received all messages in order.');
        await channel.close();
        await connection.close();
      }
    }
  });
}

main().catch(console.error);