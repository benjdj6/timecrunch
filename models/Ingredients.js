var mongoose = require('mongoose');

var IngredientSchema = new mongoose.Schema({
    name: String,
    amount: {type: Number, default: 1},
    units: String
});

mongoose.model('Ingredient', IngredientSchema);