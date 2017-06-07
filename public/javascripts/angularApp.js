var app = angular.module('timecrunch', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/templates/home.html',
      controller: 'DashCtrl'
    })
    .state('food', {
      url: '/food',
      templateUrl: '/templates/food.html',
      controller: 'ListCtrl',
      resolve: {
        foodPromise: ['foods', function(foods) {
            return foods.getFood();
        }]
      }
    })
    .state('recipes', {
      url: '/recipes',
      templateUrl: '/templates/recipes.html',
      controller: 'ListCtrl',
      resolve: {
        recipePromise: ['recipes', function(recipes) {
            return recipes.getAll();
        }]
      }
    })
    .state('recipeform', {
      url: '/recipes/form',
      templateUrl: '/templates/recipeform.html',
      controller: 'ListCtrl'
    })
    .state('recipe', {
      url: '/recipes/{id}',
      templateUrl: '/templates/recipe.html',
      controller: 'RecipesCtrl',
      resolve: {
        recipe: ['$stateParams', 'recipes', function($stateParams, recipes) {
          return recipes.get($stateParams.id);
        }]
      }
    })
    .state('editRecipe', {
      url: '/recipes/{id}/edit',
      templateUrl: '/templates/recipeeditform.html',
      controller: 'RecipesCtrl',
      resolve: {
        recipe: ['$stateParams', 'recipes', function($stateParams, recipes) {
          return recipes.get($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/templates/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}]);

// Factory for auth handling all authorization and
// user id related functions
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
      auth.saveToken(data.data.token);
    });
  };

  // logout a user and delete token
  auth.logOut = function() {
    $window.localStorage.removeItem('time-crunch-token');
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

// Factory for foods handling all related functions
app.factory('foods', ['$http', '$state', 'auth', function($http, $state, auth) {
  var o = {
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

  // Remove a food from a user's food list
  o.delete = function(food) {
    return $http.delete('/food/' + food._id).then(function(data) {
      o.getFood();
    });
  };

  return o;
}]);

// Factory for recipes handling related functions
app.factory('recipes', ['$http', 'auth', function($http, auth) {
  var o = {
    recipes: []
  };

  // Get all recipes
  o.getAll = function() {
    return $http.get('/recipes').then(function(data) {
      angular.copy(data.data, o.recipes);
    });
  };

  // Get a specific recipe
  o.get = function(id) {
    for(i = 0; i < o.recipes.length; ++i) {
      if(o.recipes[i]._id == id) {
        return o.recipes[i];
      }
    }
  };

  // Create a new recipe
  o.create = function(recipe) {
    return $http.post('/recipes', recipe, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getAll();
      return data.data._id;
    });
  };

  // Update a recipe
  o.update = function(recipe) {
    return $http.put('/recipes/' + recipe._id, recipe, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
      o.getAll();
    });
  };

  // Delete a recipe
  o.delete = function(recipe) {
    return $http.delete('/recipes/' + recipe._id).then(function(data) {
      o.getAll();
    });
  };

  return o;
}]);

// Factory for ingredients handling related functions
app.factory('ingredients', ['$http', function(){
  var o = {};
  
  // Create a new ingredient
  o.create = function(recipeID, ingredient) {
    return $http.post('/recipes/' + recipeID + '/ingredients',
      ingredient).then(function(data) {
        return data.data;
    });
  };

  // Delete an ingredient
  o.delete = function(recipeID, ingredient) {
    return $http.delete('/recipes/' + recipeID + 'ingredients/' + ingredient._id);
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
  'auth',
  'ingredients',
  'foods',
  'recipes',
  function($scope, $state, auth, ingredients, foods, recipes) {

    $scope.foods = foods.foods;
    $scope.recipes = recipes.recipes;
    $scope.ingredients = [];
    $scope.isLoggedIn = auth.isLoggedIn;

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

    $scope.sortBy = ["sellBy", "name"];
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
      if(!$scope.name || $scope.name == '' || !$scope.ingredients) {
        alert("Please make sure all fields are filled out");
        return;
      }

      if(!$scope.instructions && !$scope.link) {
        alert("Please provide either instructions or a link to the full recipe");
        return;
      }

      recipes.create({
        name: $scope.name,
        prepTime: $scope.prepTime,
        link: $scope.link,
        instructions: $scope.instructions
      }).then(function success(id) {
        // Return to the recipe list
        for(i = 0; i < $scope.instructions.length; i++) {
          ingredients.create(id, $scope.instructions[i]);
        }
        $state.go('recipes');
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    };

    // Add an ingredient to a recipe
    $scope.addIngredient = function() {
      if($scope.ing_name) {
        ($scope.ingredients).push({
          name: $scope.ing_name,
          amount: $scope.ing_amount,
          unit: $scope.ing_unit
        });
      }
      else {
        $scope.error = {
          message: "Missing ingredient name"
        };
      }
    };

    // Remove an ingredient from a recipe
    $scope.removeIngredient = function(ingredient) {
      if($scope.ingredients.length == 1) {
        $scope.ingredients = [];
      }
      else {
        for(i = 0; i < $scope.ingredients.length; i++) {
          if($scope.ingredients[i].name === ingredient.name &&
            $scope.ingredients[i].amount === ingredient.amount &&
            $scope.ingredients[i].unit === ingredient.unit) {
            $scope.ingredients.splice(i, 1);
            break;
          }
        }
      }
    };
}]);

// Controller for recipe details page
app.controller('RecipesCtrl', [
  '$scope',
  '$state',
  'recipe',
  'recipes',
  'auth',
  function($scope, $state, recipe, recipes, auth){
    $scope.recipe = recipe;

    // Determines if a user is allowed to edit this
    // recipe
    $scope.canEdit = function() {
      return recipe.author == auth.currentUser();
    };

    // Remove an ingredient from a recipe
    $scope.removeIngredient = function(ingredient) {
      if($scope.recipe.ingredients.length == 1) {
        $scope.recipe.ingredients = [];
      }
      else {
        var i = $scope.recipe.ingredients.indexOf(ingredient);
        $scope.recipe.ingredients.splice(i, 1);
      }
    };

    // Add an ingredient to a recipe
    $scope.addIngredient = function() {
      // Build the ingredient string
      var ing = $scope.ing_name.concat(" - " + $scope.ing_amount);
      if($scope.ing_unit) {
        ing = ing.concat(" " + $scope.ing_unit);
      }

      // Check if the ingredient is a duplicate
      if($scope.recipe.ingredients.indexOf(ing) > -1) {
        alert("Duplicate ingredients! Please change your entry.");
      }
      else {
        ($scope.recipe.ingredients).push(ing);
      }
    };

    // Edit an existing recipe
    $scope.editRecipe = function() {
      recipes.update($scope.recipe).then(function success() {
        // Return to the recipe list
        $state.go('recipe', {id: recipe._id});
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    }

    // Deletes the recipe
    $scope.deleteRecipe = function() {
      // Make sure user is authorized
      if($scope.canEdit()) {
        recipes.delete(recipe);
        $state.go('recipes');
      }
      else {
        // If not allowed show an alert
        alert('You cannot delete this recipe!');
      }
    };

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

// Controller for dashboard on home/index
app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
}]);