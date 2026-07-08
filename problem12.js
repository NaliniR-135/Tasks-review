const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function delay(ms){
    return new Promise((resolve) => setTimeout(reolve, ms));
}

function isValidLink(url){
    return url.includes("/buscador-eventos") !== -1;
}

function getVisibleLinks(page) {
  return page.evaluate(function() {
    const links = [];

    document.querySelectorAll("tr").forEach(function(row) {
      if (row.querySelector('a[onclick*="ExpCollGroup"]')) return; // skip group header rows
      if (window.getComputedStyle(row).display === "none") return;  // skip hidden rows

      row.querySelectorAll("a[href]").forEach(function(a) {
        const text = a.textContent.trim();
        if (a.href && !a.href.startsWith("javascript") && text.length > 0) {
          links.push({ text: text, url: a.href });
        }
      });
    });

    return links;
  });
}

async function expandAndCollect(page, groupId) {
  //links before making a click
  const beforeLinks = await getVisibleLinks(page);
  const before = {};
  beforeLinks.forEach(function(link) {
    before[link.url] = true;
  });

  // Click the expand button for the event group
  await page.evaluate(function(grpId) {
    document.querySelectorAll('a[onclick*="ExpCollGroup"]').forEach(function(toggle) {
      if (toggle.getAttribute("onclick").indexOf("'" + grpId + "'") !== -1) {
        toggle.click();
      }
    });
  }, groupId);

  await delay(3000);

  // Keep only new links
  const afterLinks = await getVisibleLinks(page);
  const seen = {};
  const newDocs = [];
  afterLinks.forEach(function(doc) {
    if (!before[doc.url] && !seen[doc.url] && isValidLink(doc.url)) {
      seen[doc.url] = true;
      newDocs.push(doc);
    }
  });

  return newDocs;
}

//function for reading the page and returing all the year groups with their events

//function for going back to page n getting all the pdfs links for the given year


//main
async function main(){
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto("https://www.ins.gov.co/buscador-eventos/Paginas/Info-Evento.aspx", {
        waitUntil: "networkidle2"
    });
    
}