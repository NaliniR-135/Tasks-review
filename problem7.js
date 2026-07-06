import axios from "axios";
import * as cheerio from "cheerio";

const BASE = "https://www.gov.uk";

const LIST_URL =
  "https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest";

  //get links
async function getLinks() {
  try {
    const res = await axios.get(LIST_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(res.data);

    //correct selector for listing page
    const hrefs = $("ul.gem-c-document-list li.gem-c-document-list__item a")
      .map((_, el) => $(el).attr("href"))
      .get();

    return [...new Set(hrefs.map((h) => BASE + h))];
  } 
  catch (err) {
    console.log("Failed to fetch list page");
    console.log(err.message);
    return [];
  }
}

//scrape article
async function scrapeArticle(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(res.data);

    const title = $("h1").first().text().trim() || $("title").text().trim();

    let date = "";

    $("dl").each((_, dl) => {
    const dt = $(dl).find("dt");
    dt.each((i, el) => {
      if ($(el).text().trim() === "Published") {
        date = $(el).next("dd").text().trim();
      }
    });
    });

    date = date || "No date found";

    let content = $("article p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    if (!content || content.length < 50) {
      content = $("main p")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ");
    }

    content = content.replace(/\s+/g, " ").slice(0, 500);

    return { url, title, date, content };
  } 
  catch (err) {
    console.log("FAILED:", url);
    return null;
  }
}

//main
async function main() {
  console.log("Fetching links...");

  const links = await getLinks();

  console.log("Links found:", links.length);
  console.log(links);

  const results = [];

  for (const link of links) {
    const data = await scrapeArticle(link);

    if (data) {
      console.log("Scraped:", data.title);
      results.push(data);
    }
  }

  console.log("\nFINAL OUTPUT:");
  console.log(results);
}

main();