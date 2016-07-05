angular.module('doggo.controllers', ['doggo.services'])

.controller('DashCtrl', function($scope) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("example: " + firebase.auth().currentUser.email)
      $scope.currentUser = firebase.auth().currentUser.email;
    } else {
      console.log("NOTHING")
    }
  });
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
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
        transitionToState("tab.dash", null, $state)
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
        transitionToState("tab.dash", null, $state)
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
      if (!firebase.auth().currentUser) { //TODO: There should probably not be an if here
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_likes');
        firebase.auth().signInWithRedirect(provider);
      } else {
        signOut(); //TODO: attach signOut to side menu
      }
    };

    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        var token = result.credential.accessToken;
        console.log(token)
      } else {
        var token = null;
      }
      var user = result.user;
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
    });

    statusChangeListener(); //TODO: Plant this in App entry point (main state)

$scope.rerouteToRegistration = function() {
  transitionToState("registration", null, $state)
};



})

function signOut(){
  firebase.auth().signOut();
}

function statusChangeListener(){
  // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var refreshToken = user.refreshToken;
      var providerData = user.providerData;
      document.getElementById('quickstart-sign-in').textContent = 'Log out';
      console.log(JSON.stringify({
        displayName: displayName,
        email: email,
        emailVerified: emailVerified,
        photoURL: photoURL,
        isAnonymous: isAnonymous,
        uid: uid,
        refreshToken: refreshToken,
        providerData: providerData
      }, null, '  '));

      transitionToState();
    } else {
      // User is signed out.
      //TODO: redirect to login dialog if user is not connected
      console.log("user is signed out")
      document.getElementById('quickstart-sign-in').textContent = 'Sign In With Facebook';
      token = null;

    }
  });

}

function transitionToState(targetState, params, state) {
  if (params != null) {
    state.go(targetState, params)
  } else {
    state.go(targetState)
  }
};
