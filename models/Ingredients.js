var mongoose = require('mongoose');

var IngredientSchema = new mongoose.Schema({
    name: String,
    amount: {type: Number, default: 1},
    units: String,
    recipe: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}
});

mongoose.model('Ingredient', IngredientSchema);