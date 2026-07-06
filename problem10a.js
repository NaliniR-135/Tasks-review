//this has pagination and collects the urls from all the pages too
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
async function collectUrlsOnCurrentPage(page, urls) {
    var html = await page.content();
    var $ = cheerio.load(html);

    $("#RegTable tbody tr").each(function (i, element) {
        var link = $(element).find("a").first().attr("href");
        urls.push(link);
    });
}

async function isLastPage(page) {
    var disabled = await page.$eval("#RegTable_next", function (btn) {
        return btn.classList.contains("disabled");
    });
    return disabled;
}

async function scrappingData() {
    console.log("Opening browser...");
    var browser = await puppeteer.launch({ 
      headless: true 
    });
    var page = await browser.newPage();

    await page.goto(
        "https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",{
           waitUntil: "networkidle2" 
    });

    await page.waitForSelector("#RegTable tbody tr");
    console.log("Page loaded.");

    await page.evaluate(function () {
        $("#cboReportType").val("Memoranda").trigger("change");
    });

    await page.evaluate(function () {
        $("#divdtFrom").datepicker("setDate", new Date(2024, 0, 1));
    });
    console.log("Start date set to 01/01/2024.");

    await wait(500);

    await page.click("#btnRefresh");
    console.log("Filters applied. Waiting for results to load...");

    await wait(20000);
    console.log("Collecting URLs...");

    var urls = [];
    var pageNumber = 1;

    while (true) {
        console.log("Collecting URLs from page", pageNumber);
        await collectUrlsOnCurrentPage(page, urls);

        
        var done = await isLastPage(page);
        if(done){
          break;
        }

        await page.click("#RegTable_next");
        await wait(1500);
        pageNumber++;
    }
    console.log("\nTotal URLs found:", urls.length);
    console.log(urls);

    await browser.close();
    return urls;
}
scrappingData().catch(console.error);