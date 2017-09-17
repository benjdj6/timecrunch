var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');

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
  "tsp": 4.929,
  "L": 1000.0
};

var to_g = {
  "lb": 453.592,
  "oz": 28.35,
  "mg": 0.001,
  "kg": 1000
};

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

// GET all food
router.get('/', auth, function(req, res, next) {
  Food.find({ 'owner': req.payload.username }, function(err, food){
    if(err){
      return next(err);
    }
    res.json(food);
  });
});

// POST food
router.post('/', auth, function(req, res, next) {
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
router.put('/:food', auth, function(req, res, next) {
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
router.delete('/:food', function(req, res, next) {
  Food.remove({_id: req.food}, function(err) {
    if(err) {
      res.send(err);
    }
    res.sendStatus(204);
  }); 
});

module.exports = router;