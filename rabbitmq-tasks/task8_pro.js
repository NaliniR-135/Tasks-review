const amqp = require('amqplib');
const axios = require('axios');
const cheerio = require('cheerio');

const QUEUE_NAME = 'govuk-urls';
const BASE_URL = 'https://www.gov.uk';

const PAGE_URL =
  'https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);

  const { data: html } = await axios.get(PAGE_URL);
  const $ = cheerio.load(html);
  const links = $('.gem-c-document-list__item-title a');

  console.log(`Found ${links.length} article links on page 1`);

  let queuedCount = 0;
  
  links.each((_, el) => {
    const href = $(el).attr('href');
    if (!href) {
      return;
    }
    const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    channel.sendToQueue(QUEUE_NAME, Buffer.from(fullUrl));
    console.log(`Queued: ${fullUrl}`);
    queuedCount++;
  });

  console.log(`Done, ${queuedCount} URLs pushed to '${QUEUE_NAME}'`);

  await channel.close();
  await connection.close();
}

main().catch((err) => {
  console.error('Producer failed:', err.response?.status ?? err.message);
});