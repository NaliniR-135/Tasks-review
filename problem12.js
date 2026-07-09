// this is my code to get the data dynamically even if it is accessed any year it shd give last 3 years thats
// const puppeteer = require("puppeteer");
// const fs = require("fs");

// function delay(ms){
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }

// //we are only getting the visible links on the current page and skipping the event and year rows
// function getVisibleLinks(page) {
//   return page.evaluate(function() {
//     const links = [];
//     document.querySelectorAll("tr").forEach(function(row) {
//       if (row.querySelector('a[onclick*="ExpCollGroup"]')) return; // skip group year and event rows
//       if (window.getComputedStyle(row).display === "none") return;  // skip hidden rows
//       row.querySelectorAll("a[href]").forEach(function(a) {
//         const text = a.textContent.trim();
//         if (a.href && !a.href.startsWith("javascript") && text.length > 0) {
//           links.push({ text: text, url: a.href });
//         }
//       });
//     });
//     return links;
//   });
// }

// //we are only expanding the year and event rows so that the links are visible
// async function expandAndCollect(page, groupId) {
//   //links before making a click
//   const beforeLinks = await getVisibleLinks(page);
//   const before = {};
//   beforeLinks.forEach(function(link) {
//     before[link.url] = true;
//   });
//   // Click the expand button for the event pdfs
//   await page.evaluate(function(grpId) {
//     document.querySelectorAll('a[onclick*="ExpCollGroup"]').forEach(function(toggle) {
//       if (toggle.getAttribute("onclick").includes("'" + grpId + "'")) {
//         toggle.click();
//       }
//     });
//   }, groupId);
//   await delay(3000);
//   // Keep only new links
//   const afterLinks = await getVisibleLinks(page);
//   const seen = {};
//   const newDocs = [];
//   afterLinks.forEach(function(doc) {
//     if (!before[doc.url] && !seen[doc.url] && isValidLink(doc.url)) {
//       seen[doc.url] = true;
//       newDocs.push(doc);
//     }
//   });
//   return newDocs;
// }

// //an extra check though it is handeled in expand function
// function isValidLink(url){
//     return url.includes("/buscador-eventos");
// }

// //for years that have files directly under them without any evento rows
// async function expandYearDirect(page, groupId) {
//     const beforeLinks = await getVisibleLinks(page);
//     const before = {};
//     beforeLinks.forEach(function(link) { before[link.url] = true; });
//     await page.evaluate(function(grpId) {
//         document.querySelectorAll('a[onclick*="ExpCollGroup"]').forEach(function(toggle) {
//             if (toggle.getAttribute("onclick").includes("'" + grpId + "'")) {
//                 toggle.click();
//             }
//         });
//     }, groupId);
//     await delay(3000);
//     const afterLinks = await getVisibleLinks(page);
//     const seen = {};
//     const newDocs = [];
//     afterLinks.forEach(function(doc) {
//         if (!before[doc.url] && !seen[doc.url] && isValidLink(doc.url)) {
//             seen[doc.url] = true;
//             newDocs.push(doc);
//         }
//     });
//     return newDocs;
// }

// //function for reading the page and returing all the year groups with their events
// async function getYearGroups(page, stopYear) {
//   const rawList = await page.evaluate(function(stopYear) {
//     //the array that contains the years with their events
//     const yearGroups = [];
//     let currentYear = null;
//     //traversing through each row to get the id, year and the events
//     document.querySelectorAll("tr").forEach(function(row) {
//       const rowText = row.textContent.trim();
//       // Skip rows with no expand button as they are pdfs
//       const expandButton = row.querySelector('a[onclick*="ExpCollGroup"]');
//       if (!expandButton) return;
//       // Get the group ID from the expand button, the regex expression filters the id like 'ExpCollGroup(17-1_1_', '17-1_1_')
//       const groupIdMatch = expandButton.getAttribute("onclick").match(/ExpCollGroup\('([^']+)'/);
//       if (!groupIdMatch) return;
//       //so here we take the second element from the array
//       const groupId = groupIdMatch[1];
//       // we are getting the year from this block, the year is stored like the yearMatch = "Ano(2026(, 2026)"
//       const yearMatch = rowText.match(/Año\s*:\s*(\d{4})\s*\(/);
//       if (yearMatch) {
//         const year = parseInt(yearMatch[1]);
//         currentYear = year > stopYear ? { year: year, groupId: groupId, events: [] } : null;
//         if (currentYear) yearGroups.push(currentYear); // fix 2: only push if not null
//         return;
//       }
//       // we are getting the event name from this block, {"Evento : DENGUE (13)", "DENGU", "13"}
//       const eventMatch = rowText.match(/Evento\s*:\s*(.+?)\s*\((\d+)\)/);
//       if (eventMatch && currentYear) {
//         //currentYear is an array that has{year:  event:[]} and event is an array that is empty yet as we didnt find any events yet
//         currentYear.events.push({ name: eventMatch[1].trim(), groupId: groupId });
//       }
//     });
//     return yearGroups;
//   }, stopYear);
//   //sort to get 2026 first then 2025
//   return rawList.sort(function(a, b) { return b.year - a.year; });
// }

// //function for going back to page n getting all the pdf links for the given year
// async function getColumnData(page, url, stopYear){
//     await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
//     await delay(5000);
//     //gets the column name from the browser tab title
//     const fullTitle = await page.title();
//     const columnName = fullTitle.split(" - ")[0].trim() || " ";
//     console.log("ColumnName:" + columnName);
//     const yearGroups = await getYearGroups(page, stopYear);
//     const results = {};
//     for(let i = 0; i < yearGroups.length; i++){
//         const yrGrp = yearGroups[i];
//         console.log("Year:" + yrGrp.year + " (" + yrGrp.events.length + " events)");
//         results[yrGrp.year] = [];
//         if (yrGrp.events.length === 0) {
//             //no evento rows so we expand the year directly and collect files
//             const docs = await expandYearDirect(page, yrGrp.groupId);
//             console.log(" " + docs.length + " doc(s)");
//             results[yrGrp.year].push({ event: "(direct)", documents: docs });
//         } else {
//             for (let j = 0; j < yrGrp.events.length; j++) {
//                 const ev = yrGrp.events[j];
//                 process.stdout.write("[" + ev.name + "]");
//                 const docs = await expandAndCollect(page, ev.groupId);
//                 console.log(" " + docs.length + " doc(s)");
//                 results[yrGrp.year].push({ event: ev.name, documents: docs });
//             }
//         }
//     }
//     return { name: columnName, data: results };
// }

// //main
// async function main(){
//     const browser = await puppeteer.launch({
//         headless: false,
//         defaultViewport: null,
//     });
//     const page = await browser.newPage();
//     await page.setDefaultNavigationTimeout(90000);

//     //gives the current year like 2026
//     const currentYear = new Date().getFullYear();
//     const stopYear = currentYear - 3;

//     const col1 = await getColumnData(page,
//         "https://www.ins.gov.co/buscador-eventos/Informesdeevento/Forms/AllItems.aspx",
//         stopYear
//     );
//     const col2 = await getColumnData(page,
//         "https://www.ins.gov.co/buscador-eventos/tablerosdecontrol/Forms/AllItems.aspx",
//         stopYear
//     );
//     //col3 gets last 3 years: 2024, 2025 and 2026
//     const col3 = await getColumnData(page,
//         "https://www.ins.gov.co/buscador-eventos/Tableros%20de%20control%20de%20laboratorio/Forms/AllItems.aspx",
//         stopYear
//     );
//     fs.writeFileSync("results.json", JSON.stringify({
//         column1: col1,
//         column2: col2,
//         column3: col3
//     }, null, 2));
//     console.log("\nSaved to results.json");
//     await browser.close();
// }

// main();

const puppeteer = require("puppeteer");
const cheerio   = require("cheerio");
const fs        = require("fs");

const YEARS_BACK = 3;
const STOP_YEAR  = new Date().getFullYear() - YEARS_BACK;

const COLUMNS = [
  { key: "column1", url: "https://www.ins.gov.co/buscador-eventos/Informesdeevento/Forms/AllItems.aspx" },
  { key: "column2", url: "https://www.ins.gov.co/buscador-eventos/tablerosdecontrol/Forms/AllItems.aspx" },
  { key: "column3", url: "https://www.ins.gov.co/buscador-eventos/Tableros%20de%20control%20de%20laboratorio/Forms/AllItems.aspx" },
];

// Wait for ms milliseconds
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Click a group row to expand it, then wait for new rows to appear
async function clickAndExpand(page, groupId) {
  await page.evaluate((id) => {
    document.querySelectorAll(`a[onclick*="'${id}'"]`).forEach((a) => a.click());
  }, groupId);
  await delay(2500);
}

// Parse the page HTML with cheerio and return year groups + their events
function parseYearGroups(html) {
  const $      = cheerio.load(html);
  const groups = [];
  let current  = null;

  $("tr").each((_, row) => {
    const text      = $(row).text().trim();
    const toggle    = $(row).find('a[onclick*="ExpCollGroup"]');
    if (!toggle.length) return;

    const onclickVal   = toggle.attr("onclick") ?? "";
    const groupIdMatch = onclickVal.match(/ExpCollGroup\('([^']+)'/);
    if (!groupIdMatch) return;
    const groupId = groupIdMatch[1];

    // Is this a year row?
    const yearMatch = text.match(/Año\s*:\s*(\d{4})\s*\(/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      current = year > STOP_YEAR ? { year, groupId, events: [] } : null;
      if (current) groups.push(current);
      return;
    }

    // Is this an event row under the current year?
    const eventMatch = text.match(/Evento\s*:\s*(.+?)\s*\(\d+\)/);
    if (eventMatch && current) {
      current.events.push({ name: eventMatch[1].trim(), groupId });
    }
  });

  return groups.sort((a, b) => b.year - a.year);
}

// After expanding a group, grab only the visible file links
function getVisibleLinks(html) {
  const $ = cheerio.load(html);
  const links = [];

  $("tr").each((_, row) => {
    // Skip group/toggle rows
    if ($(row).find('a[onclick*="ExpCollGroup"]').length) return;
    // Skip hidden rows
    if ($(row).css("display") === "none") return;

    $(row).find("a[href]").each((_, a) => {
      const href = $(a).attr("href") ?? "";
      const name = $(a).text().trim();
      if (href && !href.startsWith("javascript") && href.includes("/buscador-eventos") && name.length > 0) {
        links.push({ name, url: href.startsWith("http") ? href : `https://www.ins.gov.co${href}` });
      }
    });
  });

  return links;
}

// Scrape one column URL and return structured data
async function scrapeColumn(page, column) {
  console.log(`\nScraping ${column.key}...`);
  await page.goto(column.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await delay(3000);

  const title      = (await page.title()).split(" - ")[0].trim() || column.key;
  const yearGroups = parseYearGroups(await page.content());
  const results    = {};

  for (const yr of yearGroups) {
    console.log(`  Year ${yr.year} — ${yr.events.length} event(s)`);
    results[yr.year] = [];

    if (yr.events.length === 0) {
      // No events under this year — expand the year directly
      const before = getVisibleLinks(await page.content()).map((l) => l.url);
      await clickAndExpand(page, yr.groupId);
      const after = getVisibleLinks(await page.content()).filter((l) => !before.includes(l.url));
      console.log(`    (direct) → ${after.length} file(s)`);
      results[yr.year].push({ event: "(direct)", documents: after });
    } else {
      for (const ev of yr.events) {
        const before = getVisibleLinks(await page.content()).map((l) => l.url);
        await clickAndExpand(page, ev.groupId);
        const after = getVisibleLinks(await page.content()).filter((l) => !before.includes(l.url));
        console.log(`    [${ev.name}] → ${after.length} file(s)`);
        results[yr.year].push({ event: ev.name, documents: after });
      }
    }
  }

  return { name: title, data: results };
}

// Main
async function main() {
  console.log(`Fetching last ${YEARS_BACK} years (after ${STOP_YEAR})`);

  const browser = await puppeteer.launch({ headless: false });
  const page    = await browser.newPage();

  // Skip images/fonts to speed things up
  await page.setRequestInterception(true);
  page.on("request", (req) =>
    ["image", "font", "media", "stylesheet"].includes(req.resourceType())
      ? req.abort()
      : req.continue()
  );

  const output = {};
  for (const column of COLUMNS) {
    output[column.key] = await scrapeColumn(page, column);
  }

  await browser.close();
  fs.writeFileSync("results.json", JSON.stringify(output, null, 2));
  console.log("\nDone! Saved to results.json");
}

main();