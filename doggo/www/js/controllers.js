angular.module('doggo.controllers', ['doggo.services'])

.controller('RootController', function($scope, $location, $rootScope, $state) {
  var seenWelcomeSlides = localStorage.getItem("seenWelcomeSlides")

  if (!seenWelcomeSlides) {
    transitionToState("welcomeslides", null, $state)
  } else {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("Already logged in, skipping to app")
        transitionToState("app.main", null, $state)
      } else {
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
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.currentUser = user;
    } else {
      console.log("I WILL NEVER BE HERE")
    }
  });

  $scope.signOut = function() {
    firebase.auth().signOut();
    transitionToState("login", null, $state)
  }

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.transitionToCreateDog = function() {
    transitionToState("createDog", null, $state)
  };

})


.controller('registrationController', function($scope, $state, $ionicHistory) {

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
  $scope.emailRegister = function(email, password) {
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

.controller('createDogController', function($scope, $state, $ionicHistory, $ionicPopover) {
  var vm = this;
  vm.sizes = ['Small', 'Medium', 'Large'];
  vm.colors = ['Black', 'Brown', 'Blond', 'White', 'Grey', 'Spotted', 'Mixed'];
  vm.ages = ['Puppy', 'Adult', 'Old'];
  vm.genders = ['Male', 'Female'];
  vm.breeds = ["Mixed-Breed Dog", "Other", "Boxer", "Basset Hound", "Beagle", "Belgian Shepherd Dog", "Bloodhound", "Border Collie", "Boston Terrier", "Bull Terrier", "Bulldog", "Bullmastiff", "Canaan Dog", "Cavalier King Charles Spaniel", "Chihuahua", "Chow Chow", "Cocker Spaniel", "Collie",
                "Corgi", "Dachshund", "Dalmatian", "Dobermann", "French Bulldog", "German Shepherd Dog", "Golden Retriever", "Great Dane", "Greyhound", "Jack Russell Terrier", "Labrador", "Mastiff", "Miniature Pinscher", "Pinscher", "Pit Bull", "Pointer", "Pomeranian", "Poodle", "Pug",
                "Pyrenean Mountain Dog", "Rottweiler", "Russell Terrier", "Samoyed", "Schnauzer", "Shar Pei", "Shiba Inu", "Shih Tzu", "Siberian Husky", "Spitz", "Terrier", "St. Bernard", "Yorkshire Terrier"];

  $ionicPopover.fromTemplateUrl('templates/2breedPopOver.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover
  });

  $scope.$on('popover.hidden', function() {
    console.log(vm.selection);
  });

  // selected fruits
  vm.selection = [];

  // toggle selection for a given fruit by name
  vm.toggleSelection = function toggleSelection(dogBreed) {
    var idx = vm.selection.indexOf(dogBreed);
    // is currently selected
    if (idx > -1) {
      vm.selection.splice(idx, 1);
    }
    // is newly selected
    else {
      vm.selection.push(dogBreed);
    }
  };

  vm.createDog = function() {
    var user = firebase.auth().currentUser;
    if (!user) {
      console.log("user not logged in - how is this possible?")
      transitionToState("login", null, $state)
    } else {
      var form = vm.createForm

      console.log("form")
      console.log(form)
      var postData = {};
      postData['creator'] = user.uid;
      postData['name'] = form.name;
      postData['breed'] = vm.selection;
      postData['img'] = form.img;
      if (form.age)
        postData['age'] = form.age;
      if (form.size)
        postData['size'] = form.size;
      if (form.color)
        postData['color'] = form.color;
      if (form.chip)
        postData['chip'] = form.chip;
      if (form.gender)
        postData['gender'] = form.gender;

      console.log("post:")
      console.log(postData)

      var newPostKey = firebase.database().ref().child('dogs').push().key;
      var updates = {};
      updates['/dogs/' + newPostKey] = postData;
      //TODO: When Eli handles saving users to database, uncomment this line:
      //updates['/users/' + user.uid + '/dogs/'] = newPostKey;

      firebase.database().ref().update(updates).then(console.log("Done"));
      //TODO: Plug in "loading" functionality to play until it returns

      /*
      TODO: Handle 'owners' (like, what does that mean?)
      */
      vm.selection = [];
      vm.createForm = ''
      transitionToState("app.main", null, $state)
    }

  };
  console.log("CREATING DOGGO")

  vm.goBack = function() {
    $ionicHistory.goBack();
  }

})



function transitionToState(targetState, params, state) {
  if (params != null) {
    state.go(targetState, params)
  } else {
    state.go(targetState)
  }
};
