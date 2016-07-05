angular.module('doggo.controllers', ['doggo.services'])

.controller('RootController', function($scope, $location, $rootScope, $state) {
  var seenWelcomeSlides = localStorage.getItem("seenWelcomeSlides")

  if (!seenWelcomeSlides) {
    console.log("welcome")
    $location.path("/welcomeslides");
  } else {
    console.log("else welcome")
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user")
        console.log("Already logged in, skipping to app")
        transitionToState("app.main", null, $state)
      } else {
        console.log("no user")
        console.log("Not logged in, transitioning to login view")
        transitionToState("login", null, $state)
      }
    });
  }
})

.controller('WelcomeSlidesController', function($scope, $location, $rootScope, $state) {

  $scope.options = {
    loop: false,
    effect: 'fade',
    speed: 500,
    paginationHide: false
  }

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data) {
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function(event, data) {
    console.log('Slide change is beginning');
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data) {
    // note: the indexes are 0-based
    $scope.activeIndex = data.activeIndex;
    $scope.previousIndex = data.previousIndex;
  });

  $scope.finishWelcomeSlides = function() {
    localStorage.setItem("seenWelcomeSlides", "true")
    transitionToState("login", null, $state)
  };
})

.controller('AppController', function($scope, $ionicSideMenuDelegate, $state) {
  /* Load user data once. */
  $scope.currentUser = firebase.auth().currentUser;

  $scope.signOut = function() {
    firebase.auth().signOut();
    transitionToState("login", null, $state)
  }

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

})


.controller('registrationController', function($scope, $state, $ionicHistory) {

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
  $scope.emailRegister = function(email, password) {
    console.log($scope.email);
    console.log(email);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
        transitionToState("app.main", null, $state)
      },
      function(error) {
        console.error(error.message);
      }
    );
  };
})

.controller('LoginController', function($scope, $location, $rootScope, $state) {
  var provider = new firebase.auth.FacebookAuthProvider();
  console.log("am in login")

  //login with email and password
  $scope.emailSignIn = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(result) {
        transitionToState("app.main", null, $state)
      },
      function(error) {
        if (error.code === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          console.error(error.message);
        }
      });
  };

  $scope.FBSignIn = function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_likes');
    firebase.auth().signInWithRedirect(provider);

  };

  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      var token = result.credential.accessToken;
      console.log(token)
      transitionToState("app.main", null, $state)
      var user = result.user;
    } else {
      var token = null;
    }
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
    if (errorCode === 'auth/account-exists-with-different-credential') {
      alert('You have already signed up with a different auth provider for that email.');
    } else {
      console.error(error);
    }
  });

  $scope.rerouteToRegistration = function() {
    transitionToState("registration", null, $state)
  };
})

function transitionToState(targetState, params, state) {
  if (params != null) {
    state.go(targetState, params)
  } else {
    state.go(targetState)
  }
};
