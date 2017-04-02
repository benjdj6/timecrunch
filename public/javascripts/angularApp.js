var app = angular.module('timecrunch', ['ui.router']);

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