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
      controller: 'FoodCtrl'
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
}]);

app.factory('recipes', ['$http', function($http) {
  var o = {
    recipes: []
  };
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