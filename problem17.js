// const axios = require("axios");
// const cheerio = require("cheerio");

// const PAGE_URL =
//   "https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/completed-research-projects-office-prescription-drug-promotion-opdp-research";

// const NAV_HEADINGS = new Set(["Featured", "Products", "Topics", "Information For"]);

// async function fetchHtml(url) {
//   const { data } = await axios.get(url);
//   return data;
// }

// function extractSections(html) {
//   const $ = cheerio.load(html);

//   const allH2 = $("h2").toArray();

//   const startIdx = allH2.findIndex((h2) => {
//     const text = $(h2).text().trim();
//     return text.length > 0 && !NAV_HEADINGS.has(text);
//   });

//   if (startIdx === -1) {
//     console.warn("Could not locate the first project heading — check selectors.");
//     console.warn("All <h2> texts found:", allH2.map((h) => $(h).text().trim()));
//     return [];
//   }

//   const parent = allH2[startIdx].parent;
//   const sectionHeadings = allH2
//     .slice(startIdx)
//     .filter((h2) => h2.parent === parent);

//   const sections = [];

//   sectionHeadings.forEach((h2) => {
//     const $h2 = $(h2);
//     const title = $h2.text().trim();

//     let node = h2.next;
//     const contentParts = [];
//     while (node && !(node.type === "tag" && node.name === "h2")) {
//       if (node.type === "tag" || node.type === "text") {
//         contentParts.push($.html(node) || "");
//       }
//       node = node.next;
//     }

//     const $content = cheerio.load(contentParts.join(""));
//     const text = $content.text().replace(/\n{2,}/g, "\n\n").trim();

//     sections.push({ title, content: text });
//   });
//   sections.sort((a, b) =>
//     a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
//   );

//   return sections;
// }

// async function main() {
//   try {
//     const html = await fetchHtml(PAGE_URL);
//     const sections = extractSections(html);

//     console.log(`Extracted ${sections.length} sections\n`);
//     console.log(JSON.stringify(sections, null, 2));
//   } catch (err) {
//     console.error("Failed:", err.response?.status || err.message);
//   }
// }

// main();

//optimised
const axios = require("axios");
const cheerio = require("cheerio");

const PAGE_URL =
  "https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/completed-research-projects-office-prescription-drug-promotion-opdp-research";

const NAV_HEADINGS = new Set(["Featured", "Products", "Topics", "Information For"]);

const MORE_INFO_RE = /^more\s+information/i;
const WHITESPACE_RE = /\s+/g;

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    timeout: 15000
  });
  return data;
}

function extractSections(html) {
  const $ = cheerio.load(html);
  const allH2 = $("h2").toArray();

  const startIdx = allH2.findIndex(
    (h2) => $(h2).text().trim() && !NAV_HEADINGS.has($(h2).text().trim())
  );

  if (startIdx === -1) {
    console.warn("Could not locate the first project heading.");
  }

  const { parent } = allH2[startIdx];

  return allH2
    .slice(startIdx)
    .filter((h2) => h2.parent === parent)//finds all the other h2 that has the same parent h2
    .map((h2) => parseSection($, h2))//proper structure is given as title and content
    .sort((a, b) => a.title.localeCompare(b.title));
}

function parseSection($, h2El) {
  const $h2 = $(h2El);
  const title = $h2.text().trim();

  const contentParts = [];

  $h2.nextUntil("h2").each((_, el) => {
    const text = $(el).text().trim();
    if (!text || MORE_INFO_RE.test(text)) return false; 
    contentParts.push(text);
  });

  const content = contentParts.join(" ").replace(WHITESPACE_RE, " ").trim();
  return { title, content };
}

async function main() {
  const html = await fetchHtml(PAGE_URL);
  const sections = extractSections(html);
  console.log(`Extracted ${sections.length} sections\n`);
  console.log(JSON.stringify(sections, null, 2));
  return sections;
}

main().catch((err) => {
  console.error("Failed:", err.response?.status ?? err.message);
  process.exit(1);
});