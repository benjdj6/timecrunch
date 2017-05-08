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
      controller: 'ListCtrl',
      resolve: {
        foodPromise: ['foods', function(foods) {
            return foods.getAll();
        }]
      }
    })
    .state('recipes', {
      url: '/recipes',
      templateUrl: '/recipes.html',
      controller: 'ListCtrl',
      resolve: {
        recipePromise: ['recipes', function(recipes) {
            return recipes.getAll();
        }]
      }
    })
    .state('recipeform', {
      url: '/recipes/form',
      templateUrl: '/recipeform.html',
      controller: 'ListCtrl'
    })
    .state('recipe', {
      url: '/recipes/{id}',
      templateUrl: '/recipe.html',
      controller: 'RecipesCtrl',
      resolve: {
        recipe: ['$stateParams', 'recipes', function($stateParams, recipes) {
          return recipes.get($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http', '$window', function($http, $window) {
  var auth = {};

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
      auth.saveToken(data.token);
    });
  };

  // logout a user and delete token
  auth.logOut = function() {
    $window.localStorage.removeItem('flapper-news-token');
  };

  // check if user is logged in
  auth.isLoggedIn = function() {
    var token = auth.getToken();

    if(token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  // returns currently logged in username
  auth.currentUser = function() {
    if(auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
      }
    };

  return auth;
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

  o.get = function(id) {
    for(i = 0; i < o.recipes.length; ++i) {
      if(o.recipes[i]._id == id) {
        return o.recipes[i];
      }
    }
  };

  o.create = function(recipe) {
    return $http.post('/recipes', recipe).then(function(data) {
      o.getAll();
    });
  };

  o.delete = function(recipe) {
    return $http.delete('/recipes/' + recipe._id).then(function(data) {
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

// Controller for recipe and food lists
app.controller('ListCtrl', [
  '$scope',
  '$state',
  'foods',
  'recipes',
  function($scope, $state, foods, recipes) {

    $scope.foods = foods.foods;
    $scope.recipes = recipes.recipes;
    $scope.ingredients = [];

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

    // Add a new food
    $scope.addFood = function() {
      // Make sure food name is valid
      if(!$scope.name || $scope.name == '') {
        alert("Please fill in the name field");
        return; 
      }
      // If sell by was left blank, set it to 2 years from now
      if(!$scope.sellBy) {
        $scope.sellBy = new Date();
        $scope.sellBy.setDate($scope.sellBy.getDate() + 730);
      }
      foods.create({
        name: $scope.name,
        sellBy: $scope.sellBy,
        amount: $scope.amount,
        units: $scope.units,
        category: $scope.category
      });
    };

    // Remove a food
    $scope.removeFood = function(food) {
      foods.delete(food);
    };

    // Add a new recipe
    $scope.addRecipe = function() {
      //Check that the recipe has a name, ingredients, and instructions
      if(!$scope.name || $scope.name == '' || !$scope.ingredients
        || !$scope.instructions) {
        alert("Please make sure all fields are filled out");
        return;
      }

      recipes.create({
        name: $scope.name,
        ingredients: $scope.ingredients,
        prepTime: $scope.prepTime,
        instructions: $scope.instructions
      });

      // Return to the recipe list
      $state.go('recipes');
    };

    // Remove a recipe
    $scope.removeRecipe = function(recipe) {
      recipes.delete(recipe);
    };

    // Add an ingredient to a recipe
    $scope.addIngredient = function() {
      // Build the ingredient string
      var ing = $scope.ing_name.concat(" - " + $scope.ing_amount);
      if($scope.ing_unit) {
        ing = ing.concat(" " + $scope.ing_unit);
      }

      // Check if the ingredient is a duplicate
      if($scope.ingredients.indexOf(ing) > -1) {
        alert("Duplicate ingredients! Please change your entry.");
      }
      else {
        ($scope.ingredients).push(ing);
      }
    };

    // Remove an ingredient from a recipe
    $scope.removeIngredient = function(ingredient) {
      if($scope.ingredients.length == 1) {
        $scope.ingredients = [];
      }
      else {
        var i = $scope.ingredients.indexOf(ingredient);
        $scope.ingredients.splice(i, 1);
      }
    };
}]);

// Controller for recipe details page
app.controller('RecipesCtrl', [
  '$scope',
  'recipe',
  'recipes',
  function($scope, recipe, recipes){
    $scope.recipe = recipe;

    // Temporarily empty
}]);

// Controller for logging in and registering
app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth) {
    $scope.user = {};

    // Registers a new user
    $scope.register = function() {
      auth.register($scope.user).then(function() {
        // Go to dashboard once logged in
        $state.go('home');
      });
    };

    // Starts a new login session
    $scope.logIn = function() {
      auth.logIn($scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go('home');
      });
    };
}]);

// Controller for dashboard on home/index
app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.logOut = auth.logOut;
}]);