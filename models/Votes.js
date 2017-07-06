var mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
  user: String,
  recipe_id: String
});

mongoose.model('Vote', VoteSchema);