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
    });

  $urlRouterProvider.otherwise('home');
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
      console.log(i);
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

    $scope.addFood = function() {
      if(!$scope.name || $scope.name == '') {
        alert("Please fill in the name field");
        return; 
      }
      if(!$scope.sellBy) {
        $scope.sellBy = new Date();
        $scope.sellBy.setDate($scope.sellBy.getDate() + 730);
      }
      foods.create({
        name: $scope.name,
        sellBy: $scope.sellBy,
        amount: $scope.amount,
        category: $scope.category
      });
    };

    $scope.removeFood = function(food) {
      foods.delete(food);
    };

    $scope.addRecipe = function() {
      if(!$scope.name || $scope.name == '' || !$scope.ingredients
        || !$scope.instructions) {
        alert("Please make sure all fields are filled out");
        return;
      }

      var ingredients = ($scope.ingredients).split(',');
      for(i = 0; i < ingredients.length; ++i) {
        ingredients[i] = ingredients[i].split(' ');
        temp = ingredients[i][0];
        for(j = 1; j < ingredients[i].length; ++j) {
          if(ingredients[i][j] != "") {
            temp = temp.concat(" " + ingredients[i][j]);
          }
        }
        ingredients[i] = temp;
      }

      recipes.create({
        name: $scope.name,
        ingredients: ingredients,
        prepTime: $scope.prepTime,
        instructions: $scope.instructions
      });

      $state.go('recipes');
    };

    $scope.buildString = function(ingredients) {
      var result = ingredients[0];
      for(i = 1; i < ingredients.length; ++i) {
        result = result.concat(", " + ingredients[i]);
      }
      return result;
    };
}]);

// Controller for dashboard on home/index
app.controller('RecipesCtrl', [
  '$scope',
  'recipe',
  'recipes',
  function($scope, recipe, recipes){
    $scope.recipe = recipe;
}]);

// Controller for dashboard on home/index
app.controller('NavCtrl', [
  '$scope',
  '$state',
  function($scope, $state){
    
    //Temp empty
}]);