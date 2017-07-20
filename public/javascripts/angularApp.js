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

    $scope.sortBy = ["-score", "sellBy", "name"];
    $scope.filterCat = "";

    // Set containing ingredient names
    let ingNames = new Set();

    // Function used to filter food by category
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

    // Update specific food
    $scope.updateFood = function(food) {
      // Make sure food name is valid
      if(!food.name || food.name == '') {
        alert("Please fill in the name field");
        return;
      }

      foods.update(food).then(function success() {
        // Reload food list
        $state.go('food');
      }, function failure(error) {
        // Show error message
        $scope.error = error.data;
      });
    }

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
        instructions: $scope.instructions,
        private: $scope.private
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
          ingNames.add($scope.ingredients[i].name);
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

// Controller for recipe details page and edit form
app.controller('RecipesCtrl', [
  '$scope',
  '$state',
  'ingredients',
  'recipe',
  'recipes',
  'auth',
  function($scope, $state, ingredients, recipe, recipes, auth){
    $scope.recipe = recipe;
    $scope.voted = (recipe.vote != null)
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
          ingNames.add($scope.recipe.ingredients[i].name);
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

    // Upvote this recipe
    $scope.upvoteRecipe = function() {
      if(auth.isLoggedIn()) {
        if($scope.voted) {
          recipes.unvote($scope.recipe);
          $scope.voted = false;
        }
        else {
          recipes.upvote($scope.recipe);
          $scope.voted = true;
        }
      }
      else {
        $scope.error = {
          message: "You must be logged in to vote"
        };
      }
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