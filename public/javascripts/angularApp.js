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