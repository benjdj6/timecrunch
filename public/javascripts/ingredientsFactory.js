// Factory for ingredients handling related functions
angular.module('timecrunch').factory('ingredients', ['$http', function($http){
  let o = {};
  
  // Create a new ingredient
  o.create = function(recipeID, ingredient) {
    return $http.post('/recipes/' + recipeID + '/ingredients',
      ingredient).then(function(data) {
        return data.data;
    });
  };

  // Delete an ingredient
  o.delete = function(recipeID, ingredient) {
    return $http.delete('/recipes/' + recipeID + 'ingredients/' + ingredient._id);
  };

  return o;
}]);