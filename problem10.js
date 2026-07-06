//it doesnt have pagination it collects the data only from first page
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function scrapping() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",{
      waitUntil: "networkidle2"
  });

  await page.waitForSelector("#RegTable tbody tr");

  await page.select("#cboReportType", "Circular Letters");

  // Set the From date
  await page.$eval("#date-from", el => {
     el.value = "01/01/2024";
  });
  
  await new Promise(resolve => setTimeout(resolve, 30000));

  await page.click("#btnRefresh");

  // we wait for the table to update
  await new Promise(resolve => setTimeout(resolve, 20000));

  const html = await page.content();
  const $ = cheerio.load(html);

  const urls = [];

  $("#RegTable tbody tr").each((i, element) => {
    const link = $(element).find("a").first().attr("href");

    if (link) {
      urls.push(link);
    }
  });
  await browser.close();

  console.log(`Found ${urls.length} URLs`);
  console.log(urls);

  return urls;

}

scrapping();