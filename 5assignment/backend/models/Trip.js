const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    destination: String,
    price: Number,
    duration: String
});

module.exports = mongoose.model("Trip", tripSchema);