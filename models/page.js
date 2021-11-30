const mongoose = require('mongoose')
const pageSchema = new mongoose.Schema({
    title: String,
    keywords: String,
    description: String,
    content: String,
    sublinks: [{type:String}],
    date: {type: Date, default: Date.now},
    imageLinks: [{type:String}],
    url: String,
})
module.exports  = mongoose.model('Page',pageSchema)