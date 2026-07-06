//applied pagination to all the types and wrote to a single array as objects
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectUrlsOnCurrentPage(page, urls) {
  const html = await page.content();
  const $ = cheerio.load(html);

  $("#RegTable tbody tr").each((i, element) => {
    const link = $(element).find("a").first().attr("href");
    if (link) urls.push(link);
  });
}

async function isLastPage(page) {
  return await page.$eval("#RegTable_next", btn =>
    btn.classList.contains("disabled")
  );
}

async function applyFilters(page, type) {
  console.log(`Applying filter: ${type}`);

  await page.evaluate((type) => {
    $("#cboReportType").val(type).trigger("change");
  }, type);

  await page.evaluate(() => {
    $("#divdtFrom").datepicker("setDate", new Date(2024, 0, 1));
  });
  await wait(2000);

  await page.click("#btnRefresh");

  //we are waiting for the table to refresh properly
  await page.waitForSelector("#RegTable tbody tr");
  await wait(3000);
}

async function scrappingType(page, type) {
  let urls = [];
  let pageNumber = 1;

  await applyFilters(page, type);

  while (true) {
    console.log(`Page ${pageNumber} of ${type}`);

    await collectUrlsOnCurrentPage(page, urls);

    const last = await isLastPage(page);
    if(last){
        break;
    }

    await page.click("#RegTable_next");
    await wait(2000);

    pageNumber++;
  }

  return urls;
}

async function mainFunction() {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",{
         waitUntil: "networkidle2" 
    });

  await page.waitForSelector("#RegTable");

  const types = ["Circulars", "Circular Letters", "Memoranda"];

  const result = [];

  for (const type of types) {
    const urls = await scrappingType(page, type);

    result.push({
      type,
      urls
    });
  }

  await browser.close();

  console.log(result);
}

mainFunction().catch(console.error);