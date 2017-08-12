// Controller for recipe and food lists
angular.module('timecrunch').controller('ListCtrl', [
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
    $scope.imperial = false;

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

    $scope.metric_units = [
      "ml",
      "L",
      "mg",
      "g",
      "kg",
      "cm",
      "mm"
    ];

    $scope.imperial_units = [
      "lb",
      "oz",
      "fl.oz",
      "gal",
      "qt",
      "pt",
      "c",
      "tbsp",
      "tsp"
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