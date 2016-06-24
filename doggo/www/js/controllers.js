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

.controller('LoginController', function($scope, $location, $rootScope) {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("example: " + firebase.auth().currentUser.email)
      $scope.currentUser = firebase.auth().currentUser.email;
      transitionToState($location, $rootScope, "/tab/dash")
    } else {
      console.log("NOTHING")
    }
  });


  $scope.login = function(username, password) {
    firebase.auth().signInWithEmailAndPassword(username, password).then(function(result) {
        transitionToState($location, $rootScope, "/tab/dash")
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
