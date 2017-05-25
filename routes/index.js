var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var Recipe = mongoose.model('Recipe');
var User = mongoose.model('User');

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
router.post('/recipes', auth, function(req, res, next) {
  var recipe = new Recipe(req.body);
  recipe.author = req.payload.username;

  recipe.save(function(err, recipe) {
    if(err) {
      return next(err);
    }
    res.json(recipe);
  });
});

// PUT recipe
router.put('/recipes/:recipe', function(req, res, next) {
  Recipe.update({_id: req.recipe}, {$set: req.body}, function(err) {
    if(err) {
      res.send(err);
    }
    res.sendStatus(204);
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

// POST new user
router.post('/register', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Please fill out all fields' });
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function(err) {
    if (err) {
      return next(err);
    }
    
    return res.json({ token: user.generateJWT() });
  });
});

// POST new user session/login
router.post('/login', function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            returnnext(err);
        }

        if (user) {
            return res.json({ token: user.generateJWT() });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
