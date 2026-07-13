/*getting on the 39 articles link from a website where the links are embedded inside the script tag and not inside html tag
generally if the page has the class names starting with et_pb then such websites uauslly have the links inside the script part*/

const axios = require("axios");
const cheerio = require("cheerio");

const PAGE_URL = "https://www.zbs-giz.si/ustanovni-akti-in-porocila/";

async function main() {
    const response = await axios.get(PAGE_URL);
    const html = response.data;
    const $ = cheerio.load(html);

    let linkData = [];

    // Look through every script tag
    $("script").each((index, element) => {

        if (linkData.length > 0) {
            return;
        }

        const script = $(element).html();

        if (!script.includes("et_link_options_data")) {
            return;
        }

        // Extract only the JSON array
        const start = script.indexOf("[");
        const end = script.lastIndexOf("]");
        const jsonText = script.substring(start, end + 1);
        linkData = JSON.parse(jsonText);
    });

    if (linkData.length === 0) {
        console.log("No links found.");
        return;
    }

    const results = [];

    for (const item of linkData) {

        if (!item.class.startsWith("et_pb_blurb_")) {
            continue;
        }

        const block = $("." + item.class);

        if (block.length === 0) {
            continue;
        }

        const title =
            block.find("h4.et_pb_module_header").text().trim();

        results.push({
            title: title,
            href: item.url
        });

    }

    console.log("Total Articles:", results.length);

    for (const article of results) {
        console.log(article.title, "->", article.href);
    }

}

main().catch(console.error);