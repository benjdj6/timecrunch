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
      o.getAll();
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

  o.getAll = function() {
    return $http.get('/recipes').then(function(data) {
      angular.copy(data.data, o.recipes);
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
      "Herb/Spice",
      "Meat",
      "Sauce",
      "Vegetable",
      "Other-Ingredient",
      "Other-Food",
      "Other-Produce"
    ];

    $scope.sortBy = "name";
    $scope.filterCat = "";

    $scope.filter = function() {
      return function(item) {
        if($scope.filterCat == "" || !$scope.filterCat
          || $scope.filterCat == item.category) {
          return true;
        }
        return false;
      };
    };

    $scope.addFood = function() {
      if(!$scope.name || $scope.name == '') {
        alert("Please fill in the name field");
        return; 
      }
      if(!$scope.sellBy) {
        $scope.sellBy = new Date();
        $scope.sellBy.setDate($scope.sellBy.getDate() + 730);
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