angular.module('doggo.controllers', ['doggo.services'])

.controller('RootController', function($scope, $location, $rootScope) {
  var seenWelcomeSlides = localStorage.getItem("seenWelcomeSlides")

  if (!seenWelcomeSlides) {
    $location.path("/welcomeslides");
  } else {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("Already logged in, skipping to app")
        transitionToState($location, $rootScope, "/app/main")
      } else {
        console.log("Not logged in, transitioning to login view")
        transitionToState($location, $rootScope, "/login")
      }
    });
  }
})

.controller('WelcomeSlidesController', function($scope, $location, $rootScope) {

  $scope.options = {
    loop: false,
    effect: 'fade',
    speed: 500,
    paginationHide: false
  }

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
    console.log('Slide change is beginning');
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
    // note: the indexes are 0-based
    $scope.activeIndex = data.activeIndex;
    $scope.previousIndex = data.previousIndex;
  });

  $scope.finishWelcomeSlides = function() {
    localStorage.setItem("seenWelcomeSlides", "true")
    $location.path("/login");
  };
})

.controller('AppController', function($scope, $ionicSideMenuDelegate) {

  /* Load user data once. */
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.currentUser = firebase.auth().currentUser;
    }
  });

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

})

.controller('LoginController', function($scope, $location, $rootScope) {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("example: " + firebase.auth().currentUser.email)
      $scope.currentUser = firebase.auth().currentUser.email;
      transitionToState($location, $rootScope, "/app/main")
    } else {
      console.log("NOTHING")
    }
  });


  $scope.login = function(username, password) {

    firebase.auth().signInWithEmailAndPassword(username, password).then(function(result) {
        transitionToState($location, $rootScope, "/app/main")
      },
      function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          console.error(error);
        }
      });
  };
});

function transitionToState(location, rootScope, path) {
  rootScope.$apply(function() {
    location.path(path);
  })
};
