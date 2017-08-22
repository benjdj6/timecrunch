var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Recipe = mongoose.model('Recipe');
var Ingredient = mongoose.model('Ingredient');
var Vote = mongoose.model('Vote');

var jwt = require('express-jwt');
var auth = jwt({ secret: process.env.SECRET, userProperty: 'payload' });

//Dictionaries with conversion rates for various units to mL and g
var to_ml = {
  "gal": 3785.41,
  "fl.oz": 29.5735,
  "qt": 946.353,
  "pt": 473.176,
  "c": 240,
  "tbsp": 14.787,
  "tsp": 4.929
};

var to_g = {
  "lb": 453.592,
  "oz": 28.35
};

//Lists containing metric and imperial units to be used for identifying
var metric_units = [
  "ml",
  "L",
  "mg",
  "g",
  "kg",
  "cm",
  "mm"
];

var imperial_units = [
  "lb",
  "oz",
  "fl.oz",
  "gal",
  "qt",
  "pt",
  "c",
  "tbsp",
  "tsp"
];

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

// GET all recipes for logged in users
router.get('/', auth, function(req, res, next) {
  Recipe.find( { $or: [
    { 'private': false },
    { 'private': null},
    { 'private': true, 'author': req.payload.username }] },
    function(err, recipe) {
    if(err) {
      return next(err);
    }
    res.json(recipe);
  });
});

// GET all recipes for logged out users
router.get('/public', function(req, res, next) {
  Recipe.find( { $or: [
    { 'private': false },
    { 'private': null}] },
    function(err, recipe) {
    if(err) {
      return next(err);
    }
    res.json(recipe);
  });
});

// GET specific recipe for logged out users
router.get('/public/:recipe', function(req, res, next) {
  req.recipe.populate('ingredients', function(err, recipe) {
    if(err) {
      return next(err);
    }

    res.json(recipe);
  });
});

// GET specific recipe for logged in users
router.get('/:recipe', auth, function(req, res, next) {
  req.recipe.populate('ingredients', function(err, recipe) {
    if(err) {
      return next(err);
    }

    Vote.findOne({ 
      user: req.payload.username,
      recipe_id: recipe._id
    },
    function(err, vote) {
      if(err) {
        return next(err);
      }
      res.json({
        recipe: recipe,
        vote: vote
      });
    });
  });
});

// POST recipe
router.post('/', auth, function(req, res, next) {
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
router.put('/:recipe', auth, function(req, res, next) {
  Recipe.update({_id: req.recipe, author: req.payload.username},
                {$set: req.body}, function(err, rec) {
    if(err) {
      res.send(err);
    }
    else if(rec['n'] == 0) {
      res.sendStatus(401);
    }
    else {
      res.sendStatus(204);
    }
  });
});

// PUT upvote recipe
router.put('/:recipe/vote', auth, function(req, res, next) {
  Vote.findOne({
    user: req.payload.username,
    recipe_id: req.recipe._id
  }, function(err, vote) {
    if(err) {
      return next(err);
    }
    else if(vote) {
      res.sendStatus(423);
    }
    else {
      req.recipe.vote(function(err, recipe) {
        if(err) {
          return next(err);
        }
        var vote = new Vote({
          user: req.payload.username,
          recipe_id: req.recipe._id
        });

        vote.save(function(err, vote) {
          if(err) {
            return next(err);
          }

          res.json(vote);
        });
      });
    }
  });
});

// Delete recipe vote
router.delete('/:recipe/vote/:vote', function(req, res, next) {
  Vote.remove({_id: req.vote}, function(err) {
    if(err) {
      res.send(err);
    }

    req.recipe.unvote(function(err, recipe) {
      if(err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

// DELETE recipe
router.delete('/:recipe', auth, function(req, res, next) {
  if(req.recipe.author != req.payload.username) {
    res.sendStatus(403);
  }
  else {
    Recipe.remove({_id: req.recipe}, function(err) {
      if(err) {
        res.send(err);
      }
      res.sendStatus(204);
    });
  }
});

// POST ingredient
router.post('/:recipe/ingredients', function(req, res, next) {
  var ingredient = new Ingredient(req.body);

  ingredient.name = ingredient.name.toLowerCase();
  ingredient.name = ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1);
  for(i = 1; i < ingredient.name.length; ++i) {
    if(ingredient.name.charAt(i - 1) == " ") {
      ingredient.name = ingredient.name.slice(0, i) + ingredient.name.charAt(i).toUpperCase() + ingredient.name.slice(i + 1);
    }
  }

  ingredient.recipe = req.recipe;

  if ingredient.unit == "L":
    ingredient.universal_unit = ingredient.amount * 1000;

  ingredient.save(function(err, ingredient) {
    if(err) {
      return next(err);
    }

    req.recipe.ingredients.push(ingredient);
    req.recipe.save(function(err, recipe) {
      if(err) {
        return next(err);
      }

      res.json(ingredient);
    });
  });
});

// DELETE ingredient
router.delete('/:recipe/ingredients/:ingredient', function(req, res, next) {
  Ingredient.remove({_id: req.ingredient}, function(err) {
    if(err) {
      res.send(err);
    }
    res.sendStatus(204);
  });
});

module.exports = router;