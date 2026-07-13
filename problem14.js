const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function main() {
  const browser = await puppeteer.launch({ 
    headless: true 
  });
  const page = await browser.newPage();

  await page.goto("https://www.a2x.co.za/news/", { 
    waitUntil: "networkidle2"
   });
  await page.waitForSelector("#NewsMsgTbl tbody .newsDetailView");
  const html = await page.content();
  const $ = cheerio.load(html);

  const links = [];

  $(".newsDetailView").each((index, element) => {
    const newsRef = $(element).attr("newsref"); 

    links.push({
      link: `https://www.a2x.co.za/news/news-detail?newsRef=${newsRef}`
    });
  });

  console.log("Found", links.length, "articles");

  links.forEach((a) => {
    console.log(a.link);
  });
  await browser.close();
}

main().catch(console.error);