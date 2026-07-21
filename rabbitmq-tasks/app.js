require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');
const cheerio = require('cheerio');

const QUEUE = process.env.QUEUE_NAME;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const BASE_URL = 'https://www.gov.uk';
const RECONNECT = 5000;
const DELAY = 8000;

let ch = null;
const seen = new Set();

async function init() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    ch = await conn.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });
    console.log('amqp ready');

    conn.on('close', () => {
      console.warn('amqp disconnected, reconnecting...');
      ch = null;
      setTimeout(init, RECONNECT);
    });
    conn.on('error', err => console.error('amqp error:', err.message));
  } catch (err) {
    console.error('amqp init failed:', err.message);
    setTimeout(init, RECONNECT);
  }
}

function push(url) {
  if (!ch) {
    console.warn('no channel yet, retrying:', url);
    setTimeout(() => push(url), RECONNECT);
    return;
  }
  try {
    ch.sendToQueue(QUEUE, Buffer.from(url), { persistent: true });
    console.log('push queued:', url);
  } catch (err) {
    console.error('push failed, retrying:', err.message);
    setTimeout(() => push(url), RECONNECT);
  }
}

async function tick() {
  if (!ch) return;

  let msg;
  try {
    msg = await ch.get(QUEUE, { noAck: false });
  } catch (err) {
    console.error('tick channel.get failed:', err.message);
    return;
  }

  if (!msg) return;
  const url = msg.content.toString();

  try {
    if (url === require('./pro').MAIN_URL) {
      console.log('tick extracting:', url);
      await expand(url);
    } else {
      console.log('tick consuming:', url);
      // process article here
    }
    ch.ack(msg);
  } catch (err) {
    console.error('tick failed:', err.message);
    ch.nack(msg, false, false);
  }
}

async function expand(pageUrl) {
  const response = await axios.get(pageUrl, { responseType: 'text' });
  const $ = cheerio.load(response.data);

  const fresh = $(".gem-c-document-list__item-title a")
    .toArray()
    .map(el => BASE_URL + $(el).attr('href'))
    .filter(url => !seen.has(url));

  console.log(`expand ${fresh.length} new urls found`);

  fresh.forEach((url, i) => {
    seen.add(url);
    setTimeout(() => push(url), i * DELAY);
  });
}

module.exports = { init, tick };