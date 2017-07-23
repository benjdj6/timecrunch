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

// GET all food
router.get('/food', auth, function(req, res, next) {
  Food.find({ 'owner': req.payload.username }, function(err, food){
    if(err){
      return next(err);
    }
    res.json(food);
  });
});

// POST food
router.post('/food', auth, function(req, res, next) {
  var food = new Food(req.body);
  food.owner = req.payload.username;

  food.name = food.name.toLowerCase();
  food.name = food.name.charAt(0).toUpperCase() + food.name.slice(1);
  for(i = 1; i < food.name.length; ++i) {
    if(food.name.charAt(i - 1) == " ") {
      food.name = food.name.slice(0, i) + food.name.charAt(i).toUpperCase() + food.name.slice(i + 1);
    }
  }

  food.save(function(err, food){
    if(err) {
      return next(err);
    }
    res.json(food);
  });
});

// PUT food
router.put('/food/:food', auth, function(req, res, next) {
  Food.update({_id: req.food, owner: req.payload.username},
                {$set: req.body}, function(err, food) {
    if(err) {
      res.send(err);
    }
    else if(food['n'] == 0) {
      res.sendStatus(401);
    }
    else {
      res.sendStatus(204);
    }
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

module.exports = router;