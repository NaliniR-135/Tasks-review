// solution for ticket amlc(2) - for first page only

const axios = require("axios");
const https = require("https");

const SITE_URL = "https://www.amlc.gov.ph";
const insecureAgent = new https.Agent({ rejectUnauthorized: false });
const PAGE = 1;
const LIMIT = 10;

function slugToUrl(rawSlug) {
  const normalized = rawSlug.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();

  return `${SITE_URL}/news-and-announcements/${encodeURIComponent(normalized)}`;
}

async function fetchSanctionUrls() {
  const response = await axios.get(`${SITE_URL}/api/un-sanctions`, {
    params: { page: PAGE, limit: LIMIT },
    httpsAgent: insecureAgent,
  });

  const records = response.data?.data ?? [];

  const firstPage = records.slice(0, LIMIT);

  return firstPage.map((record) => ({
    url: slugToUrl(record.slug),
  }));
}

async function main() {
  try {
    const urls = await fetchSanctionUrls();
    console.log(`Total URLs found: ${urls.length}\n`);

    for (const u of urls) {
      console.log(`  ${u.url}`);
    }
  } catch (err) {
    const reason = err.response?.status ?? err.message;
    console.error("Request failed:", reason);
  }
}

main();