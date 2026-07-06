// const axios = require("axios");
// const cheerio=require("cheerio");

// const Api_endpoint = "https://www.nyse.com/api/notifications/public/system/1/summaries/filter?pageSize=9&pageNumber=0&sortKey=publishedDate&sortOrder=desc" ;
// const base_url = "https://www.nyse.com/api/notifications/public/summary/";

// function cleanbody(html){
//     if(!html){
//         console.error(err);
//     }
//     const $ = cheerio.load(html);
//     return $("body").text().replace(/\s+/g, " ");
// }

// function getdata(data){
//     return{
//     ID: data.id,
//     URL: `${base_url}#${data.id}?systemId=1`,
//     Title: data.subject,
//     Publishedate:new Date(data.publishedDate).toISOString(),
//     Content: cleanbody(data.body)
//     };

// }
// async function main(){
//     try{
//     const item = await axios.get(Api_endpoint);
//     const res = item.data.data;
//     const result = res.map(getdata);
//     console.log(result);
//     }
//     catch(err){
//         console.error(err);
//     }
// }

// main();

const axios = require("axios");
const cheerio = require("cheerio");

const Api_endpoint =
  "https://www.nyse.com/api/notifications/public/system/1/summaries/filter?pageSize=9&pageNumber=0&sortKey=publishedDate&sortOrder=desc";

const Base_api =
  "https://www.nyse.com/api/notifications/public/summary/";

function cleanBody(html) {
  const $ = cheerio.load(html);

  return $("body").text().replace(/\s+/g, " ").trim();
}

async function getDetail(id) {
  const url = `${Base_api}${id}?systemId=1`;

  const result = await axios.get(url);

  return {
    ID: result.data.id,
    URL: url,
    Title: result.data.subject,
    PublishedDate: new Date(result.data.publishedDate).toISOString(),
    Content: cleanBody(result.data.body),
  };
}

async function main() {
  try {
    const index = await axios.get(Api_endpoint);
    const ids = index.data.data.map(item => item.id);
    console.log("IDs:", ids);
    const results = [];
    for (const id of ids) {
      try {
        const detail = await getDetail(id);
        results.push(detail);
      } 
      catch (err) {
        console.log(`Failed to fetch ${id}`);
      }
    }
    console.log(results);
  } 
  catch (err) {
    console.error(err);
  }
}

main();