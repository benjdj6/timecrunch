var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var Recipe = mongoose.model('Recipe');
var User = mongoose.model('User');
var Ingredient = mongoose.model('Ingredient');
var Vote = mongoose.model('Vote');

var passport = require('passport');

var jwt = require('express-jwt');
var auth = jwt({ secret: process.env.SECRET, userProperty: 'payload' });

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'time crunch' });
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

// Param function for selecting ingredient objects
router.param('ingredient', function(req, res, next, id) {
    var query = Ingredient.findById(id);

    query.exec(function (err, ingredient) {
        if (err) { return next(err); }
        if (!ingredient) { return next(new Error('can\'t find ingredient')); }

        req.ingredient = ingredient;
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

// Param function for selecting vote objects
router.param('vote', function(req, res, next, id) {
  var query = Vote.findById(id);

  query.exec(function(err, vote) {
    if (err) { return next(err); }
    if (!vote) { return next(new Error('can\'t find vote')); }

    req.vote = vote;
    return next();
  });
});

module.exports = router;