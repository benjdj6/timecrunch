// Controller for logging in and registering
angular.module('timecrunch').controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth) {
    $scope.user = {};

    // Registers a new user
    $scope.register = function() {
      auth.register($scope.user).then(function success() {
        // Go to dashboard once logged in
        $state.go('home');
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    };

    // Starts a new login session
    $scope.logIn = function() {
      auth.logIn($scope.user).then(function success() {
        // Go to dashboard once logged in
        $state.go('home');
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    };
}]);