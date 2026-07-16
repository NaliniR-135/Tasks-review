const axios = require("axios");
const cheerio = require("cheerio");

const URL = "http://oscbulletin.carswell.com/bb/osc/bb/4905/on4905.htm";
const ANCHOR_PATTERN = /^[A-Z]_\d+_\d+$/;

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function hasAnchor($el) {
  const name = $el.find("a[name]").attr("name");
  return !!name && ANCHOR_PATTERN.test(name);
}

async function scrapeBulletin() {
  const { data: html } = await axios.get(URL);
  const $ = cheerio.load(html);

  const notices = $("p").filter((_, el) => hasAnchor($(el)));
  const result = {};

  notices.each((_, el) => {
    const $p = $(el);

    const chapter = cleanText($p.prevAll("h3").first().text()).replace(/^[A-Z]\.\s*/, "");//chapter value from this
    const section = cleanText($p.prevAll("h4:not([align])").first().text()); //section values from this

    const content = $p
      .nextUntil("p:has(a[name])")
      .map((_, node) => cleanText($(node).text()))//returns pobjects 
      .get()//converts objects to js array
      .filter(Boolean)//removes the empty string from the array
      .join(" ");//we join all the pieces of contents to form full content

    result[chapter] ??= {};
    result[chapter][section] ??= [];
    result[chapter][section].push({ title: cleanText($p.text()), content });
  });

  return result;
}

scrapeBulletin()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Failed:", err.message));