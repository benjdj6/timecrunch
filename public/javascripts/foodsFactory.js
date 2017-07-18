// Factory for foods handling all related functions
angular.module('timecrunch').factory('foods', ['$http', '$state', 'auth', function($http, $state, auth) {
  let o = {
    foods: []
  };

  // Load food list for the current user
  o.getFood = function() {
    if(auth.isLoggedIn()) {
      return $http.get('/food', {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function(data) {
        angular.copy(data.data, o.foods);
      });
    }
    $state.go('login');
  };

  // Add a food to a user's food list
  o.create = function(food) {
    return $http.post('/food', food, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getFood();
    });
  };

  // Update a specific food
  o.update = function(food) {
    return $http.put('/food/' + food._id, food, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getFood();
    });
  }

  // Remove a food from a user's food list
  o.delete = function(food) {
    return $http.delete('/food/' + food._id).then(function(data) {
      o.getFood();
    });
  };

  return o;
}]);