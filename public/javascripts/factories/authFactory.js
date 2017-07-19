// Factory for auth handling all authorization and
// user id related functions
angular.module('timecrunch').factory('auth', ['$http', '$window', function($http, $window) {
  let auth = {};

  // save given token
  auth.saveToken = function(token) {
    $window.localStorage['time-crunch-token'] = token;
  };

  // get token from localStorage
  auth.getToken = function() {
    return $window.localStorage['time-crunch-token'];
  };

  // register user
  auth.register = function(user) {
    return $http.post('/register', user).then(function(data) {
      auth.saveToken(data.data.token);
    });
  };

  // login user save token
  auth.logIn = function(user) {
    return $http.post('/login', user).then(function(data) {
      auth.saveToken(data.data.token);
    });
  };

  // logout a user and delete token
  auth.logOut = function() {
    $window.localStorage.removeItem('time-crunch-token');
  };

  // check if user is logged in
  auth.isLoggedIn = function() {
    let token = auth.getToken();

    if(token) {
      let payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  // returns currently logged in username
  auth.currentUser = function() {
    if(auth.isLoggedIn()) {
      let token = auth.getToken();
      let payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
      }
    };

  return auth;
}]);