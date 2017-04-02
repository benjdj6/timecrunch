var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Time Crunch' });
});

/* GET food list page. */
router.get('/food', function(req, res, next) {
  res.render('food', { title: 'Time Crunch - Food' });
});

module.exports = router;
