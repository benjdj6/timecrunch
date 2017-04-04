var app = angular.module('timecrunch', ['ui.router']);

app.config([
  'stateProvider',
  'urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'DashCtrl'
    });

    $urlRouterProvider.otherwise('home');
}]);

app.factory('foods', ['$http', function($http) {
  var o = {
    foods: []
  };
}]);

app.factory('recipes', ['$http', function($http) {
  //recipes methods
}]);

// Controller for dashboard on home/index
app.controller('DashCtrl', [
  '$scope',
  'foods',
  function($scope, foods){
    $scope.foods = foods.foods;
}]);