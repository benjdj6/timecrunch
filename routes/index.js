var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var Recipe = mongoose.model('Recipe');

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Time Crunch' });
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

module.exports = router;
