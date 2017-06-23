var mongoose = require('mongoose');

var RecipeSchema = new mongoose.Schema({
    name: String,
    author: String,
    ingredients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    prepTime: {type: Number, default: 30},
    link: String,
    instructions: String,
    private: {type: Boolean, default: false},
    score: {type: Number, default: 1}
});

mongoose.model('Recipe', RecipeSchema);