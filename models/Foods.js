var mongoose = require('mongoose');

var FoodSchema = new mongoose.Schema({
    name: String,
    sellBy: Date,
    amount: {type: Number, default: 1},
    unit: String,
    category: String
});

mongoose.model('Food', FoodSchema);