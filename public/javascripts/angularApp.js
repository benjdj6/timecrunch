let app = angular.module('timecrunch', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    //Home state for dashboard
    .state('home', {
      url: '/home',
      templateUrl: '/templates/home.html',
      controller: 'DashCtrl'
    })
    //Food state sends loaded food list to ListCtrl
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
    //Recipes state sends loaded recipe list to ListCtrl
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
    //Recipeform state for recipe creation
    .state('recipeform', {
      url: '/recipes/form',
      templateUrl: '/templates/recipeform.html',
      controller: 'ListCtrl'
    })
    //Recipe state sends specific recipe data to RecipesCtrl
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
    //EditRecipe state loads specific recipe in RecipesCtrl
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
    //Login state redirects if user is logged in
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
    //Register state redirects if user is logged in
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

  //if no known state go home
  $urlRouterProvider.otherwise('home');
}]);