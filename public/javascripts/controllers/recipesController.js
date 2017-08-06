// Controller for recipe details page and edit form
angular.module('timecrunch').controller('RecipesCtrl', [
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

    $scope.metric_units = [
      "ml",
      "L",
      "mg",
      "g",
      "kg",
      "cm",
      "mm"
    ];

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