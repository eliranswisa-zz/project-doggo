// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('doggo', ['ionic', 'firebase', 'doggo.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('root', {
    url: '/',
    templateUrl: 'templates/root.html',
    controller: 'RootController'
  })

  .state('welcomeslides', {
    url: '/welcomeslides',
    templateUrl: 'templates/welcomeSlides.html',
    controller: 'WelcomeSlidesController'
  })

  .state('createDog', {
    url: '/createDog',
    templateUrl: 'templates/createDog.html',
    controller: 'createDogController as createDog'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginController'
  })

  .state('registration', {
    url: '/registration',
    templateUrl: 'templates/registration.html',
    controller: 'registrationController'
  })


  // setup an abstract state for the main directive
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppController'
  })

    .state('app.main', {
      url: '/main',
      views: {
        'menuContent' : {
          templateUrl: 'templates/main.html'
        }
      }
    })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

});
