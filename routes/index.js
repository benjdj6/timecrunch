var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var Recipe = mongoose.model('Recipe');

// GET home page.
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Time Crunch' });
});

// Param function for selecting food objects
router.param('food', function(req, res, next, id) {
    var query = Food.findById(id);

    query.exec(function (err, food){
        if (err) { return next(err); }
        if (!food) { return next(new Error('can\'t find food')); }

        req.food = food
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

module.exports = router;
