var mongoose = require('mongoose');

var RecipeSchema = new mongoose.Schema({
    name: String,
    author: String,
    ingredients: [{type: String}],
    prepTime: {type: Number, default: 30},
    instructions: String
});

mongoose.model('Recipe', RecipeSchema);