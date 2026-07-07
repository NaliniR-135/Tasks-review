const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const url = "https://www.hkex.com.hk/Services/Circulars-and-Notices/Participant-and-Members-Circulars?sc_lang=en";
const limit = 250;

function delay(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollUntillEnd(page){
    let noChangeTimes = 0;
    while(true){
        //we are counting how many pages are on the current page
        const count  = await page.$$eval(".whats_on_tdy_row", (elements) => 
            elements.length
        );
        console.log(`Articles loaded so far: ${count}`);

        //if we have them = to limit, then stop
        if(count >= limit){
            console.log("We got 250 articles, so stop scrolling");
            break;
        }

        //we scroll tot the bottom of the webpage
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight)
        });

        //after reaching down we wait for smtime for the next articles to load
        await delay(10000);

        //we shd count again the new articles 
        const newCount  = await page.$$eval(".whats_on_tdy_row", (elements) => elements.length);
        console.log(`Articles after scrolling: ${newCount}`);

        //to stop the website from infinitely running
        if(newCount === count){
            noChangeTimes++;
        }
        else{
            noChangeTimes = 0;
        }
        if (noChangeTimes >= 20) {
            console.log("Page stopped loading new articles. Moving on.");
            break;
        }
    }
}

async function extractData(html){
    const $ = cheerio.load(html);
    const articles = [];

    //traverising through each row
    $(".whats_on_tdy_row").each((index, element) => {
        //to get title and link
        const title = $(element).find(".whats_on_tdy_text_2").find("a").children().remove().end().text().trim();
        let link  = $(element).find(".whats_on_tdy_text_2").find("a").attr("href");
        if(link.startsWith("/")){
            link = "https://www.hkex.com.hk" + link;
        }

        //to get date
        const date = $(element).find(".whats_on_tdy_ball").find(".whats_on_tdy_ball_number").children().text().trim();
        const month_year = $(element).find(".whats_on_tdy_ball").find(".whats_on_tdy_ball_number").next().text().trim();
        const full_date = `${date} ${month_year}`;
        
        //reference number
        const ref_number = $(element).find(".whats_on_tdy_text_3").text().replace("Ref Number:", "").trim();

        //department name
        const dept_name = $(element).find(".whats_on_tdy_text_1").find("a").text().trim();

        articles.push({
            title,
            link,
            full_date,
            ref_number,
            dept_name
        });
    });
    console.log(`Extracted ${articles.length} articles`);
    return articles;
}

async function main(){
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: "networkidle2"
    });
    console.log("Opened HkEX page");

    await delay(8000);
    
    //calling the function scrollUntillEnd
    await scrollUntillEnd(page);

    const html = await page.content();

    const articles = await extractData(html);

    fs.writeFileSync("HEX.json", JSON.stringify(articles, null, 3));
    console.log("File created and written");

    await browser.close();
    
    console.log("Task completed");
}
main();