require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');
const cheerio = require('cheerio');

const QUEUE = process.env.QUEUE_NAME;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const BASE_URL = 'https://www.gov.uk';
const RECONNECT = 3000;//wait for 5seconds before trying the dead connection
const DELAY = 2000;//we wait for 2seconds before pushing a new url into queue

const seen = new Set();
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ch = null;

async function init() {//used to create the connection and reconnect after restart}
  const connect = async () => {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      ch = await conn.createChannel();
      await ch.assertQueue(QUEUE, { durable: true });
      console.log('amqp ready');

      conn.on('close', () => {
        console.warn('amqp disconnected, trying to reconnect');
        ch = null;
        setTimeout(connect, RECONNECT);
      });
      conn.on('error', err => console.error('amqp error:', err.message));
    } catch (err) {
      console.error('amqp init failed:', err.message);
      setTimeout(connect, RECONNECT);
    }
  };
  await connect();
}

async function scrapeAndQueue(pageUrl) {
  const { data } = await axios.get(pageUrl, { responseType: 'text' });
  const $ = cheerio.load(data);

  const urls = $(".gem-c-document-list__item-title a")
    .toArray()
    .map(el => BASE_URL + $(el).attr('href'))
    .filter(url => !seen.has(url));

  console.log(`scrapeAndQueue: ${urls.length} new urls found`);

  for (const url of urls) {
    if (!ch) { await sleep(RECONNECT); continue; }
    seen.add(url);
    ch.sendToQueue(QUEUE, Buffer.from(url), { persistent: true });
    console.log('scrapeAndQueue: queued:', url);
    await sleep(DELAY);
  }
}

async function processQueue() {
  let msg;
  try {
    msg = await ch.get(QUEUE, { noAck: false });//we should manually ack/nack the message, if we crash before ack rabbitmq redelivers it, if channel is dead it throws, we catch and return
  } catch (err) {
    console.error('processQueue: get failed:', err.message);
    return;
  }
  if (!msg) return;

  const url = msg.content.toString();

  try {
    if (url === require('./pro').MAIN_URL) {
      console.log('processQueue: main url received, scraping:', url);
      await scrapeAndQueue(url);
    } else {
      console.log('processQueue: article url received:', url);
      // process article here
    }
    ch.ack(msg);
  } catch (err) {
    console.error('processQueue: failed:', err.message);
    ch.nack(msg, false, false);
  }
}

module.exports = { init, processQueue };