// Controller for dashboard on home/index
angular.module('timecrunch').controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
}]);