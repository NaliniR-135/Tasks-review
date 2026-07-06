const articles = [
  {
    id: 1,
    title: "EU Tax Reform Updates",
    type: "pdf",
    words: 1200
  },
  {
    id: 2,
    title: "Climate Change Regulations",
    type: "html",
    words: 2500
  },
  {
    id: 3,
    title: "Data Privacy Guidelines",
    type: "pdf",
    words: 1800
  },
  {
    id: 4,
    title: "Financial Compliance Report",
    type: "html",
    words: 3200
  },
  {
    id: 5,
    title: "Healthcare Policy Changes",
    type: "pdf",
    words: 950
  },
  {
    id: 6,
    title: "Employment Law Amendments",
    type: "html",
    words: 2700
  },
  {
    id: 7,
    title: "Consumer Protection Rules",
    type: "pdf",
    words: 1450
  },
  {
    id: 8,
    title: "International Trade Update",
    type: "html",
    words: 4100
  },
  {
    id: 9,
    title: "Banking Sector Reforms",
    type: "pdf",
    words: 2200
  },
  {
    id: 10,
    title: "Energy Market Analysis",
    type: "html",
    words: 1600
  },
  {
    id: 11,
    title: "AI Governance Framework",
    type: "pdf",
    words: 3400
  },
  {
    id: 12,
    title: "Cybersecurity Standards",
    type: "html",
    words: 2900
  },
  {
    id: 13,
    title: "Insurance Industry Review",
    type: "pdf",
    words: 800
  },
  {
    id: 14,
    title: "Public Procurement Rules",
    type: "html",
    words: 2100
  },
  {
    id: 15,
    title: "Environmental Compliance Guide",
    type: "pdf",
    words: 3800
  },
  {
    id: 16,
    title: "Tax Filing Procedures",
    type: "html",
    words: 1400
  },
  {
    id: 17,
    title: "Digital Services Act Summary",
    type: "pdf",
    words: 2600
  },
  {
    id: 18,
    title: "Corporate Governance Code",
    type: "html",
    words: 1750
  },
  {
    id: 19,
    title: "Competition Law Overview",
    type: "pdf",
    words: 3100
  },
  {
    id: 20,
    title: "Cross-Border Investment Rules",
    type: "html",
    words: 2300
  }
];

//Count PDF articles
const total_pdf = articles.filter((article) => 
  {article.type == "pdf"}).length;
console.log(total_pdf);

//Count HTML articles.
const total_html = articles.filter((article) => {
  article.type == "html"}).length;
console.log(total_html);

//Calculate total words across all articles.
const total_words = articles.reduce((acc, article) => {
    return acc += article.words;
}, 0);
console.log(total_words);

//Find the longest article.
const longest_article = articles.reduce((max, article) => {
    return max.words < article.words ? article: max;
});
console.log(longest_article);

//Find the shortest article.
const shortest_article = articles.reduce((min, article) => {
    return min.words > article.words ? article : min;
});
console.log(shortest_article);

//Check if any article exceeds 3500 words.
const article_exceeds = articles.some((value) => {
    return value.words > 3500;
});
console.log(article_exceeds);

//Check if all articles have a title.
const titles = articles.every((article) =>{
    return article.title;
});
console.log(titles);

//Return all PDF article titles.
const all_pdf = articles.filter(article => article.type == "pdf");
console.log(all_pdf, "total is", all_pdf.length);

//Return all HTML article titles.
const all_html = articles.filter(article => article.type == "html");
console.log(all_html, "total is", all_html.length);

//Sort articles by word count (highest to lowest).
const sort_articles_desc = articles.sort((a,b) => b.words - a.words);
console.log(sort_articles_desc);

//Sort articles alphabetically by title.
const sort_articles_asc = [...articles].sort((a,b) => a.title.localeCompare(b.title));
console.log(sort_articles_asc);

//Group articles by type.
const group = Object.groupBy(articles,
    (article) => {
        article.type
    
});
console.log(group);


//Calculate average word count for PDF articles.
const average = articles.filter(article =>article.type == "pdf");
const avg = average.reduce((sum, article) =>{
    return sum + article.words;
}, 0)/average.length;
console.log(avg);


//Calculate average word count for HTML articles.
const averagehtml = 
    articles.filter(article => article.type == "html")
    .reduce((sum, article) =>{
        return sum + article.words;
}, 0)/articles.filter(article => article.type == "html").length;
console.log(averagehtml);

//Find all articles with more than 2500 words.
const more_than_2500 = articles.filter(article => {
    return article.words > 2500;
});
console.log(more_than_2500);

//Find all articles with less than 1500 words.
const more_than_1500 = articles.filter(article => {
    return article.words > 1500;
});
console.log(more_than_1500);

//Create a new array containing only: id, title
const new_array = articles.map((article) => {
    return {
        id: article.id, 
        title: article.title
    }
});
console.log(new_array);

//Create a new array containing:id, reading time
const new_arrays = articles.map((article) => {
    return {
        title: article.title, 
        readingTime: Math.ceil(article.words/200)
    }
});
console.log(new_arrays);

//Find the top 5 longest articles.
const top_five = articles.sort((a,b) => b.words - a.words);
console.log(top_five.slice(0,5));

//Generate a summary object:
const summary_object = {
        totalArticles: articles.length,
        pdfCount: total_pdf,
        htmlCount: total_html,
        totalWords: total_words,
        /*averageWords: articles.reduce((sum, article) => {
            return sum + article.words;
        }, 0)/articles.length,*/
        averageWords: total_words/ articles.length,
        longestArticle: longest_article ,
        shortestArticle: shortest_article 
};
console.log(summary_object);