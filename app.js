const axios = require('axios'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    Page = require('./models/page'),
    dotenv = require('dotenv').config(); // to access the .env file

// Connect to MongoDB Atlas using mongoose //
// I've provided the connection string in the .env file for temporary use //
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.nhs71.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,{
   useNewUrlParser: true,
   useUnifiedTopology: true 
});
