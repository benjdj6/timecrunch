var mongoose = require('mongoose');

var FoodSchema = new mongoose.Schema({
  name: String,
  owner: String,
  sellBy: Date,
  amount: {type: Number, default: 1},
  units: String,
  category: String,
  expiring_soon: Boolean
});

mongoose.model('Food', FoodSchema);