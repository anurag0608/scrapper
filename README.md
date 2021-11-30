# Web Crawler for crawling www.moneycontrol.com
Imagine website as a node or a object, since website contains links to different websites... Let's call it as neighboring nodes or links.
There is a non-linear relationship between different links. This type of releationships can be represented by a special data structure i.e Graph.
So, technically speaking the whole internet is a complex graph like structure. Crawling a website means traversing a graph with a given starting node.
Graph can be traversed using two algorithms
- BFS or Breadth First Search 
- DFS or Depth First Search
</br>
Both algorithm can be used to crawl a website but BFS is more efficient than DFS when it comes to crawling. 
More details : https://stackoverflow.com/questions/20579169/dfs-vs-bfs-in-web-crawler-design

So, I used BFS for making this tool to crawl MoneyControl.com

## Steps to excute the code

> unzip the code</br>
> go to root directory and run `npm install`

**This will install the dependencies.**

**I've put an .env file with a valid credentials for temporary use, you don't have to change anything. The format looks like this...***</br>
> DB_USERNAME=<temp_username></br>
> DB_PASSWORD=<_password_></br>
> DB_NAME=<_databasename_></br>
> MAX_DEPTH=<_max_ depth, that a crawler can go> </br>
> TIME_THRESHOLD=<_Time_ limit for each section in seconds>` </br>

**This .env file contains credentials for connecting the appplication to MongoDB Compass (Cloud Database provided by MongoDB), follow the below step only if you want to connect to cloud DB** </br>
> Install mongoDB atlas from this link (for exploring the database): https://www.mongodb.com/try/download/compass </br>
> After installing open the MongoDB Atlas and a text box will appear saying "Paste your connection string :"</br>
> Paste this connections string : </br>
> `mongodb+srv://temp_user:saya123%40@cluster0.nhs71.mongodb.net/Scrapper?retryWrites=true&w=majority` </br>
> Click connect and now everything is ready, minimize the MongoDB Atlas :) </br>

#### For connecting mongoDB locally, the instructions are given in the `app.js` file also you can follow this link :
 https://mongoosejs.com/docs/3.2.x/docs/connections.html

### Now...
> Run this command `node app.js` </br> This will start the crawler and every section will be crawled (For this website(MoneyControl.com) Mutual Funds, News, Stock Market will be crawled ) for a given amount of time and depth </br>
> The parsed data will be stored in an Object which will be stored in the Mongo Collection

## Page Schema
{ </br>
     `title`: String, </br>
     `keywords`: String, </br>
     `description`: String, </br>
     `content`: String, </br>
     `sublinks`: [{type:String}], </br>
     `date`: {type: Date, default: Date.now}, </br>
     `imageLinks`: [{type:String}], </br>
     `url`: String, </br>
}

**Every parsed data of a page will be stored in this format only.**

> `Title`: contains the title of the page </br>
> `keywords`: contains keywords from the meta tag </br>
> `description`: meta description </br>
> `content`: contains formated text removing all white and tab spaces from each section </br>
> `sublinks`: contains all neighboring links </br>
> `imageLinks`: contains all image links attached to the current url </br>
> `url`: current website url </br>

After complete excution of the crawler, open up the mongoDB Atlas and Navigate to left side panel which lists all the databases. </br>
**Click on "Scrapper" (Since this is our database name)** </br>
**Then click "pages" (Since this is out Collection name)** </br>
**It'll load for a bit and will list all the documents which are stored.** </br>
**You can also export the whole collection to a CSV file! for demo purpose I've added pages.csv file.**</br>