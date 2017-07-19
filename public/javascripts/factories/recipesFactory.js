// Factory for recipes handling related functions
angular.module('timecrunch').factory('recipes', ['$http', 'auth', function($http, auth) {
  let o = {
    recipes: []
  };

  // Get all recipes
  o.getAll = function() {
    if(auth.isLoggedIn()) {
      return $http.get('/recipes', {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function(data) {
        angular.copy(data.data, o.recipes);
      });
    }
    return $http.get('/recipes/public').then(function(data) {
      angular.copy(data.data, o.recipes);
    });
  };

  // Get a specific recipe
  o.get = function(id) {
    if(auth.isLoggedIn()) {
      return $http.get('/recipes/' + id, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function(data) {
        let recipe = data.data.recipe;
        recipe.vote = data.data.vote;

        return recipe;
      });
    }
    else {
      return $http.get('/recipes/public/' + id).then(function(data) {
        return data.data;
      });
    }
  };

  // Create a new recipe
  o.create = function(recipe) {
    return $http.post('/recipes', recipe, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      return data.data._id;
    });
  };

  // Update a recipe
  o.update = function(recipe) {
    return $http.put('/recipes/' + recipe._id, recipe, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getAll();
    });
  };

  // Upvote a recipe
  o.upvote = function(recipe) {
    return $http.put('/recipes/' + recipe._id + '/vote', null, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      recipe.score += 1;
      recipe.vote = data.data;
    });
  };

  // Reverse a vote on a recipe
  o.unvote = function(recipe) {
    let route = '/recipes/' + recipe._id + '/vote/' + recipe.vote._id;
    return $http.delete(route).then(function(data) {
      recipe.score -= 1;
      recipe.vote = null;
    });
  };


  // Delete a recipe
  o.delete = function(recipe) {
    return $http.delete('/recipes/' + recipe._id, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getAll();
    });
  };

  return o;
}]);

// Controller for dashboard on home/index
app.controller('DashCtrl', [
  '$scope',
  'foods',
  function($scope, foods){
    $scope.foods = foods.foods; 
}]);