let app = angular.module('timecrunch', ['ui.router']);

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

// Factory for foods handling all related functions
app.factory('foods', ['$http', '$state', 'auth', function($http, $state, auth) {
  let o = {
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
  let o = {
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
    return $http.get('/recipes/' + id).then(function(data) {
      return data.data;
    });
  };

  // Create a new recipe
  o.create = function(recipe) {
    return $http.post('/recipes', recipe, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).then(function(data) {
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
app.factory('ingredients', ['$http', function($http){
  let o = {};
  
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

    // Set containing ingredient names
    let ingNames = new Set();

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
        $scope.error = {
          message: "Please make sure all fields are filled out"
        };
        return;
      }

      if(!$scope.instructions && !$scope.link) {
        $scope.error= {
          message: "Please provide either instructions or a link to the full recipe"
        };
        return;
      }

      recipes.create({
        name: $scope.name,
        prepTime: $scope.prepTime,
        link: $scope.link,
        instructions: $scope.instructions
      }).then(function success(id) {
        // Return to the recipe list
        for(i = 0; i < $scope.ingredients.length; i++) {
          ingredients.create(id, $scope.ingredients[i]);
        }
        $scope.recipes = recipes.recipes;
        $state.go('recipes');
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    };

    // Add an ingredient to a recipe
    $scope.addIngredient = function() {
      // Load existing ingredients into ingNames
      if(ingNames.size == 0 && $scope.ingredients.length > 0) {
        for(i = 0; i < $scope.ingredients.length; i++) {
          ingNames.add($scope.ing_name);
        }
      }
      // If ingredient already exists show alert
      if(ingNames.has($scope.ing_name)) {
        $scope.error = {
          message: "Duplicate ingredient, please change ingredient name"
        };
        return;
      }

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

      // Add new ingredient name to the set
      ingNames.add($scope.ing_name);
    };

    // Remove an ingredient from a recipe
    $scope.removeIngredient = function(ingredient) {
      if($scope.ingredients.length == 1) {
        $scope.ingredients = [];
      }
      else {
        let i = $scope.ingredients.indexOf(ingredient);
        // Remove ingredient name from set
        ingNames.delete(ingredient.name);
        $scope.ingredients.splice(i, 1);
      }
    };
}]);

// Controller for recipe details page
app.controller('RecipesCtrl', [
  '$scope',
  '$state',
  'ingredients',
  'recipe',
  'recipes',
  'auth',
  function($scope, $state, ingredients, recipe, recipes, auth){
    $scope.recipe = recipe;
    // Set containing ingredient names
    let ingNames = new Set();

    // Determines if a user is allowed to edit this
    // recipe
    $scope.canEdit = function() {
      return recipe.author == auth.currentUser();
    };

    // Remove an ingredient from a recipe
    $scope.removeIngredient = function(ingredient) {
      if($scope.recipe.ingredients.length == 1) {
        $scope.recipe.ingredients = [];
        ingNames.clear();
      }
      else {
        let i = $scope.recipe.ingredients.indexOf(ingredient);
        // Remove ingredient name from set
        ingNames.delete(ingredient.name);
        $scope.recipe.ingredients.splice(i, 1);
      }
    };

    // Add an ingredient to a recipe
    $scope.addIngredient = function() {
      // Load existing ingredients into ingNames
      if(ingNames.size < $scope.recipe.ingredients.length) {
        for(i = 0; i < $scope.recipe.ingredients.length; i++) {
          ingNames.add($scope.ing_name);
        }
      }
      // If ingredient already exists show alert
      if(ingNames.has($scope.ing_name)) {
        $scope.error = {
          message: "Duplicate ingredient, please change ingredient name"
        };
        return;
      }
      // Build the ingredient string
      let ing = {
        name: $scope.ing_name,
        amount: $scope.ing_amount,
        unit: $scope.ing_unit
      };
      if(ing.name) {
        ($scope.recipe.ingredients).push(ing);
        // Add new ingredient name to the set
        ingNames.add(ing.name);
      }
      else {
        $scope.error = {
          message: "Missing ingredient name"
        };
      }
    };

    // Edit an existing recipe
    $scope.editRecipe = function() {
      for(i = 0; i < $scope.recipe.ingredients.length; i++) {
        if(!$scope.recipe.ingredients[i]._id) {
          ingredients.create($scope.recipe._id, $scope.recipe.ingredients[i]);
        }
      }
      recipes.update($scope.recipe).then(function success() {
        // Return to the recipe list
        $state.go('recipe', {id: recipe._id});
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    };

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