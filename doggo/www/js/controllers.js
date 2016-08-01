angular.module('doggo.controllers', ['doggo.services'])

.controller('WelcomeSlidesController', function($scope, $location, $state) {

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

.controller('AppController', function(currentAuth, $scope, $ionicSideMenuDelegate, $state, Auth) {

  var vm = this;

  /* Load user data. */
  vm.auth = Auth;
  vm.auth.$onAuthStateChanged(function(firebaseUser) {
      vm.currentUser = firebaseUser;
  });

  vm.signOut = function() {
    firebase.auth().signOut();
    transitionToState("login", null, $state)
  }

  vm.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  vm.transitionToCreateDog = function() {
    console.log($state)
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

.controller('LoginController', function($scope, $location, $state, $ionicLoading) {

  var vm = this;

  var provider = new firebase.auth.FacebookAuthProvider();

  // Login with email and password
  vm.emailSignIn = function() {

    $ionicLoading.show();

    var form = vm.loginForm;
    firebase.auth().signInWithEmailAndPassword(form.email, form.password)
      .then(function(result) {
        $ionicLoading.hide();
        transitionToState("app.main", null, $state)
      })
      .catch(function(error) {

        if (error.code === 'auth/wrong-password') {
          $ionicLoading.hide();
          $ionicPopup.alert({title: 'Password incorrect'
                      });
        } else {
          $ionicPopup.alert({title: error.message});
          console.error(error.message);
          $ionicLoading.hide()
        }
      });
  };

  vm.FBSignIn = function() {

    $ionicLoading.show();

    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_likes');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      if (result.credential) {
        $ionicLoading.hide();

        var token = result.credential.accessToken;
        transitionToState("app.main", null, $state)
        var user = result.user;
      } else {
        $ionicLoading.hide();
        var token = null;
      }
    }).catch(function(error) {
      $ionicLoading.hide();
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
      } else {
        $ionicLoading.hide();
        console.error(error);
      }
    });
  };

  vm.rerouteToRegistration = function() {
    transitionToState("registration", null, $state)
  };
})

.controller('createDogController', function($scope, $state, $ionicHistory, $ionicPopover, $ionicLoading) {

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

  vm.selection = [];

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
    $ionicLoading.show();

    var user = firebase.auth().currentUser;

    var form = vm.createForm;

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

    var newPostKey = firebase.database().ref().child('dogs').push().key;
    var updates = {};
    updates['/dogs/' + newPostKey] = postData;
    //TODO: When Eli handles saving users to database, uncomment this line:
    //updates['/users/' + user.uid + '/dogs/'] = newPostKey;

    firebase.database().ref().update(updates).then(function (results) {
      $ionicLoading.hide();
      vm.selection = [];
      vm.createForm = '';
      transitionToState("app.main", null, $state);
    });

    /*
    TODO: Handle 'owners' (like, what does that mean?)
    */

  };

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
