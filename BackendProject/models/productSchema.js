const { string } = require("joi");
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    title:String,
    descriptiion:String,
    price:Number,
    image:String,
    category:String,
})
module.exports = mongoose.model('product',productSchema)