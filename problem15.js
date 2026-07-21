//this is the solution for the ticket given amlc(1) - for first page only

const axios = require("axios");
const https = require("https");

const BASE = "https://www.amlc.gov.ph";
const PAGE = 1;
const LIMIT = 6;

function buildArticleUrl(slug) {
  const cleanSlug = slug.replace(/[\r\n]+/g, " ").trim().replace(/\s+/g, " ");
  return `${BASE}/news-and-announcements/${encodeURIComponent(cleanSlug)}`;
}

async function getFirstPageUrls() {
  const { data } = await axios.get(`${BASE}/api/news`, {
    params: { page: PAGE, limit: LIMIT },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const records = data?.data ?? [];
  const firstPage = records.slice(0, LIMIT);

  return firstPage.map((item) => ({
    url: buildArticleUrl(item.slug),
  }));
}

async function main(){
  try {
    const urls = await getFirstPageUrls();
    console.log(`Found ${urls.length} urls`);
    urls.forEach((u) => console.log(`${u.url}`));
  } catch (err) {
    console.error("Failed:", err.response?.status || err.message);
  }
}
main();