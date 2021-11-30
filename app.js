const axios = require('axios'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    util = require('util'),
    sleep = util.promisify(setTimeout),
    Page = require('./models/page'),
    {Link} = require('./Link'),
    randomUserAgent = require('random-useragent'),
    colors = require('colors'),
    dotenv = require('dotenv').config(); // to access the .env file

// Connect to MongoDB Atlas using mongoose //
// I've provided the connection string in the .env file for temporary use //
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.nhs71.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,{
   useNewUrlParser: true,
   useUnifiedTopology: true 
});
async function findAllLinks(url, linkArr, currDepth,visitedLinks){
    let page = await axios.get(url, {
        headers:{
            'User-Agent':randomUserAgent.getRandom()
        }
    }).catch(err=>{
        throw err
    })
    const $ = cheerio.load(page.data)
        const anchors = $('section a')
        // Getting titles, headings and bold texts //
        const pageTitle = $('title').text();
        // console.log($('img'))
        let imageLinks = []
        let contents = []
        let sublinks = []
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
        // console.log($('section').length)
        $('section').each(function(i, elm) {
            let someText = $(this).text().replace(/(\r\n|\n|\r|\t)/gm, "");
            someText = someText.replace(/\s+/g," ")
            contents.push(someText) // for testing do text() 
        });
        // console.log(contents.length)
        let keywords = ""
        if($('meta[name="keywords"]').attr('content')!=undefined) keywords = $('meta[name="keywords"]').attr('content')
        if($('meta[name="Keywords"]').attr('content')!=undefined) keywords = $('meta[name="Keywords"]').attr('content')
        
        let count = 0
        $(anchors).each(function(i, anchor){
            let string = $(anchor).attr('href')
            if(string){
                if(string.includes("https") && string!='#' && !(string.includes("facebook.com") || string.includes("twitter.com") || string.includes("instagram.com")) ){
                    if(visitedLinks[string]!=1){ // if neighboring link is not visited
                        linkArr.push(new Link(string, currDepth+1)) // add to the queue
                        visitedLinks[string] = 1 // visit it
                        sublinks.push(string)
                        count++
                    }
                }
            }
        });
        let Obj = {
            title: pageTitle,
            keywords: keywords,
            description: $('meta[name="description"]').attr('content'),
            url: url,
            imageLinks,
            contents,
            sublinks
        }
        // console.log(Obj)
        
        await Page.create(Obj).catch(err=>{
            console.log(err)
        });
        console.log('Total linked links found for '+ url +" : "+count) // subpages
}
async function start(url, time_threshold){
    // BFS to crawl the web //
    let pendingLinks = [] // queue
    let visitedLinks = [] // will track visited list
    pendingLinks.push(new Link(url, 0)) // push the root url to the queue
    let max_depth = process.env.MAX_DEPTH // max depth to crawl
    visitedLinks[url] = 1 // visit the root url
    let time_taken = 0
    // if queue is not empty //
    while(pendingLinks.length != 0){
        let start = process.hrtime();
        // remove the first element from the queue //
        let currentLink = pendingLinks.shift()
        if(currentLink.url[0]=='#')
            continue
        // if the depth is less than max depth //
        // start the exploration //
        if(currentLink.depth < max_depth){
            console.log(`Crawling : ${currentLink.url} at depth ${currentLink.depth}`)
            await findAllLinks(currentLink.url, pendingLinks, currentLink.depth, visitedLinks)
           .catch(err=>{
                console.log("Error : "+err)
            })
        }else{
            console.log(colors.red(`Max Depth Reached!`))
            return; 
        }


        let stop = process.hrtime(start)
        time_taken += (stop[0] * 1e9 + stop[1])/1e9

        if(time_taken > time_threshold){
            console.log(colors.green(`Done Crawling! Time Taken : ${time_taken} seconds`))
            return; // done crawling for that amount of time
        }
        let minWait = 500
        let maxWait = 2000
        // make a random delay
        // without delay, website will block the crawler
        let waitTime = Math.floor((Math.random() * maxWait) + minWait)
        await sleep(waitTime)
    }
    // return new Promise((res,rej)=>{
    //     res(1)
    // })
}

const url = "https://www.moneycontrol.com/"
const sections = ["news/","stocksmarketsindia/","mutualfundindia/"]
const time_threshold = 3 // in seconds
async function crawl(){
    console.log(colors.blue(`Max Depth : ${process.env.MAX_DEPTH}, Time-Threshold : ${time_threshold} seconds`))
    console.log(colors.green("Now starting.... "))
    for(const section of sections){
        console.log(colors.yellow.underline(`Crawling section : ${section}`))
        await start(url+section, time_threshold)
        if(section==sections[sections.length-1]){
            console.log(colors.green.bold(`Done crawling All The Sections :)`))
            process.exit(0)
        }
    }
}
crawl()
