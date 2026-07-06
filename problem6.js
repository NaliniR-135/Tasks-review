//Scrapping data from urls

import axios from "axios";
import * as cheerio from "cheerio";

const arr = [
  "https://www.fca.org.uk/news/press-releases/commodity-traders-offer-one-million-pounds-crisis-fund-fca-competition-probe",
  "https://www.fca.org.uk/news/press-releases/fca-consults-proposals-support-strong-consistent-standards-sipp-market",
  "https://www.fca.org.uk/news/press-releases/investors-get-real-time-view-uk-bond-market-activity-first-time",
  "https://www.fca.org.uk/news/press-releases/fca-decides-fine-carlos-ricardo-fuenmayor-disclosure-failures",
  "https://www.fca.org.uk/news/press-releases/court-orders-appointment-special-administrators-euro-exchange-securities-uk-limited",
  "https://www.fca.org.uk/news/press-releases/fca-proposals-help-more-access-mortgages",
  "https://www.fca.org.uk/news/press-releases/fca-secures-confiscation-order-against-ponzi-scheme-fraudster",
  "https://www.fca.org.uk/news/press-releases/consumers-warned-about-misleading-car-finance-money-tips-claims-ads",
  "https://www.fca.org.uk/news/press-releases/simpler-climate-reporting-rules-could-save-firms-20m-annually",
  "https://www.fca.org.uk/news/press-releases/fca-imposes-requirements-euro-exchange-securities-uk-limited-and-interim-managers-appointed-court"
];

const results = [];

for (const url of arr) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const $ = cheerio.load(response.data);

    // Title from visible page
    const title = $("h1").first().text().trim() || $("title").text().trim();

    // Extract ONLY visible article paragraphs
    let content = $("article p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    // fallback if article structure is different
    if (!content || content.length < 50) {
      content = $("main p")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ");
    }

    if (!content || content.length < 50) {
      content = $("body p")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ");
    }

    const shortContent = content.replace(/\s+/g, " ").slice(0, 500);

    let date =
      $("time").first().attr("datetime") ||
      $("time").first().text().trim();

    if (!date) {
      date = "No date found";
    }

    results.push({
      url,
      title,
      content: shortContent,
      date
    });

  } catch (err) {
    console.log("FAILED:", url);
    console.log(err);
  }
}

console.log("Final array:");
console.log(results);