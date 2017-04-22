var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var Recipe = mongoose.model('Recipe');
var User = mongoose.model('User');

// GET home page.
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Time Crunch' });
});

// Param function for selecting food objects
router.param('food', function(req, res, next, id) {
    var query = Food.findById(id);

    query.exec(function (err, food) {
        if (err) { return next(err); }
        if (!food) { return next(new Error('can\'t find food')); }

        req.food = food;
        return next();
    });
});

// Param function for selecting recipe objects
router.param('recipe', function(req, res, next, id) {
    var query = Recipe.findById(id);

    query.exec(function (err, recipe) {
        if (err) { return next(err); }
        if (!recipe) { return next(new Error('can\'t find recipe')); }

        req.recipe = recipe;
        return next();
    });
});

// GET all food
router.get('/food', function(req, res, next) {
    Food.find(function(err, food){
        if(err){
            return next(err);
        }
        res.json(food);
    });
});

// POST food
router.post('/food', function(req, res, next) {
    var food = new Food(req.body);

    food.save(function(err, food){
        if(err) {
            return next(err);
        }
        res.json(food);
    });
});

// DELETE food
router.delete('/food/:food', function(req, res, next) {
    Food.remove({_id: req.food}, function(err) {
        if(err) {
            res.send(err);
        }
        res.sendStatus(204);
    }); 
});

// GET all recipes
router.get('/recipes', function(req, res, next) {
    Recipe.find(function(err, recipe) {
        if(err) {
            return next(err);
        }
        res.json(recipe);
    });
});

// POST recipe
router.post('/recipes', function(req, res, next) {
    var recipe = new Recipe(req.body);

    recipe.save(function(err, recipe) {
        if(err) {
            return next(err);
        }
        res.json(recipe);
    });
});

// DELETE recipe
router.delete('/recipes/:recipe', function(req, res, next) {
    Recipe.remove({_id: req.recipe}, function(err) {
        if(err) {
            res.send(err);
        }
        res.sendStatus(204);
    });
});

module.exports = router;
