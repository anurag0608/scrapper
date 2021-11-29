const axios = require('axios'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    util = require('util'),
    sleep = util.promisify(setTimeout),
    Page = require('./models/page'),
    {Link} = require('./Link'),
    randomUserAgent = require('random-useragent'),
    dotenv = require('dotenv').config(); // to access the .env file

// Connect to MongoDB Atlas using mongoose //
// I've provided the connection string in the .env file for temporary use //
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.nhs71.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,{
   useNewUrlParser: true,
   useUnifiedTopology: true 
});
async function findAllLinks(url, linkArr, currDepth){
    let page = await axios.get(url, {
        headers:{
            'User-Agent':randomUserAgent.getRandom()
        }
    }).catch(err=>{
        throw err
    })
    const $ = cheerio.load(page.data)
        const anchors = $('a')
        // Getting titles, headings and bold texts //
        const pageTitle = $('title').text();
        // console.log($('img'))
        let imageLinks = []
        let contents = []
        $('img').map(function(){ 
            let src = String($(this).attr('src'))
            let data_src = String($(this).attr('data-src'))
            // console.log(src.includes('https'))
            // console.log(data_sr.includes('https'))
            if(src.includes('https')){
                imageLinks.push(src)
            }else if(data_src.includes('https')){
                imageLinks.push(data_src)
            }
        })
        console.log($('section').length)
        $('section').each(function(i, elm) {
            let someText = $(this).text().replace(/(\r\n|\n|\r|\t)/gm, "");
            someText = someText.replace(/\s+/g," ")
            contents.push(someText) // for testing do text() 
        });
        console.log(contents.length)
        let keywords = ""
        if($('meta[name="keywords"]').attr('content')!=undefined) keywords = $('meta[name="keywords"]').attr('content')
        Obj = {
            title: pageTitle,
            keywords: keywords,
            description: $('meta[name="description"]').attr('content'),
            url: url,
            imageLinks,
            contents
        }
        // console.log(Obj)
        // Page.create(Obj, (err, new_page)=>{
        //     if(err){
        //         console.log(err.code);
        //     }else{
        //         console.log("Page Created");
        //         console.log(new_page)
        //     }
        // })
        let count = 0
        $(anchors).each(function(i, anchor){
            let string = $(anchor).attr('href')
            if(string){
                if(string[0]=='/') string = url + $(anchor).attr('href')
                if(string!='#' && !(string.includes("facebook.com") || string.includes("twitter.com") || string.includes("instagram.com")) ){
                    linkArr.push(new Link(string, currDepth+1))
                    count++
                }
            }
        });
        console.log('Total linked links found for '+ url +" : "+count) // subpages
}
async function start(url){
    // BFS to crawl the web //
    let pendingLinks = [] // queue
    let visitedLinks = [] // will track visited list
    pendingLinks.push(new Link(url, 0)) // push the root url to the queue
    let max_depth = process.env.MAX_DEPTH // max depth to crawl
    // if queue is not empty //
    while(pendingLinks.length != 0){
        // remove the first element from the queue //
        let currentLink = pendingLinks.shift()
        if(currentLink.url[0]=='#')
            continue
        // if the depth is less than max depth //
        if(visitedLinks[currentLink.url]!=1 && currentLink.depth < max_depth){
            console.log(`Crawling : ${currentLink.url} at depth ${currentLink.depth}`)
            await findAllLinks(currentLink.url, pendingLinks, currentLink.depth)
            .then(()=>{
                visitedLinks[currentLink.url] = 1 // visit it
            }).catch(err=>{
                console.log("Error : "+err)
            })
        }
        let minWait = 500
        let maxWait = 2000
        // make a random delay
        // without delay, website will block the crawler
        let waitTime = Math.floor((Math.random() * maxWait) + minWait)
        await sleep(waitTime)
    }
}

const url = "https://www.moneycontrol.com/"
const sections = ["stocksmarketsindia","news","mutualfundindia"]
start(url+sections[2]);