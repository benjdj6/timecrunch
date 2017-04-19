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
      controller: 'FoodCtrl',
      resolve: {
        foodPromise: ['foods', function(foods) {
            return foods.getAll();
        }]
      }
    })
    .state('recipes', {
      url: '/recipes',
      templateUrl: '/recipes.html',
      controller: 'RecipesCtrl',
      resolve: {
        recipePromise: ['recipes', function(recipes) {
            return recipes.getAll();
        }]
      }
    })
    .state('recipeform', {
      url: '/recipeform',
      templateUrl: '/recipeform.html',
      controller: 'RecipesCtrl'
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

  o.create = function(recipe) {
    return $http.post('/recipes', recipe).then(function(data) {
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

// Controller for dashboard on home/index
app.controller('FoodCtrl', [
  '$scope',
  'foods',
  function($scope, foods){
    $scope.foods = foods.foods;

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
}]);

// Controller for dashboard on home/index
app.controller('RecipesCtrl', [
  '$scope',
  '$state',
  'recipes',
  function($scope, $state, recipes){
    $scope.recipes = recipes.recipes;

    $scope.addRecipe = function() {
      if(!$scope.name || $scope.name == '' || !$scope.ingredients
        || !$scope.instructions) {
        alert("Please make sure all fields are filled out");
        return;
      }

      var ingredients = ($scope.ingredients).split(',');
      for(i = 0; i < ingredients.length; ++i) {
        while(ingredients[i].charAt(0) == " ") {
          ingredients[i] = ingredients[i].slice(1, ingredients[i].length);
        }
      }

      recipes.create({
        name: $scope.name,
        ingredients: ingredients,
        prepTime: $scope.prepTime,
        instructions: $scope.instructions
      });
    };

    $scope.buildString = function(ingredients) {
      var result = ingredients[0];
      for(i = 1; i < ingredients.length; ++i) {
        result = result.concat(", " + ingredients[i]);
      }
      return result;
    };

    $scope.recipeform = function() {
      console.log('here');
      $state.go('recipeform');
    };
}]);

// Controller for dashboard on home/index
app.controller('NavCtrl', [
  '$scope',
  '$state',
  function($scope, $state){
    
    $scope.home = function() {
      $state.go('home');
    };

    $scope.food = function() {
      $state.go('food');
    };

    $scope.recipes = function() {
      $state.go('recipes');
    };
}]);