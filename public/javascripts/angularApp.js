var app = angular.module('timecrunch', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'DashCtrl'
    })
    .state('food', {
      url: '/food',
      templateUrl: '/food.html',
      controller: 'FoodCtrl',
      resolve: {
        foodPromise: ['foods', function(foods) {
            return foods.getAll();
        }]
      }
    })
    .state('recipes', {
      url: '/recipes',
      templateUrl: '/recipes.html',
      controller: 'RecipesCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('foods', ['$http', function($http) {
  var o = {
    foods: []
  };

  o.getAll = function() {
    return $http.get('/food').then(function(data) {
      angular.copy(data.data, o.foods);
    });
  };

  o.create = function(food) {
    return $http.post('/food', food).then(function(data) {
      o.foods.push(data);
    });
  };

  o.delete = function(food) {
    return $http.delete('/food/' + food._id).then(function(data) {
      o.getAll();
    });
  };

  return o;
}]);

app.factory('recipes', ['$http', function($http) {
  var o = {
    recipes: []
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

// Controller for dashboard on home/index
app.controller('FoodCtrl', [
  '$scope',
  'foods',
  function($scope, foods){
    $scope.foods = foods.foods;

    $scope.categories = [
      "Baking",
      "Dairy",
      "Fruit",
      "Meat",
      "Seasoning",
      "Vegetable",
      "Other-Ingredient",
      "Other-Food",
      "Other-Produce"
    ];

    $scope.addFood = function() {
      if(!$scope.name || $scope.name == '') {
        alert("Please fill in the name field");
        return; 
      }
      foods.create({
        name: $scope.name,
        sellBy: $scope.sellBy,
        amount: $scope.amount,
        category: $scope.category
      });
    };

    $scope.removeFood = function(food) {
      foods.delete(food);
    };
}]);

// Controller for dashboard on home/index
app.controller('RecipesCtrl', [
  '$scope',
  'recipes',
  function($scope, recipes){
    $scope.recipes = recipes.recipes;
}]);

// Controller for dashboard on home/index
app.controller('NavCtrl', [
  '$scope',
  '$state',
  function($scope, $state){
    
    $scope.home = function() {
      $state.go('home');
    };

    $scope.food = function() {
      $state.go('food');
    };

    $scope.recipes = function() {
      $state.go('recipes');
    };
}]);