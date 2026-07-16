const amqp = require('amqplib');

const QUEUE_NAME = 'hello-queue';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME);

  console.log('Waiting for messages. To exit press CTRL+C');

  channel.consume(QUEUE_NAME, (msg) => {
    if (msg !== null) {
      console.log(`Received: ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);