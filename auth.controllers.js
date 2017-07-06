angular.module('petbook.auth.controllers', [])


.controller('WelcomeCtrl', function($scope, $state, $ionicModal){
	$scope.bgs = ["img/welcome-bg.jpg"];

	$scope.facebookSignIn = function(){
		console.log("doing facebook sign in");
		$state.go('app.feed');
	};

	$ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

	$ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };

	$scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };
})

.controller('CreateAccountCtrl', function($scope, $state){
	$scope.doSignUp = function(){
		console.log("doing sign up");
		$state.go('app.feed');
	};
})

.controller('WelcomeBackCtrl', function($scope, $state, $ionicModal){
	$scope.doLogIn = function(){
		console.log("doing log in");
		$state.go('app.feed');
	};

	$ionicModal.fromTemplateUrl('views/auth/forgot-password.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.forgot_password_modal = modal;
  });

  $scope.showForgotPassword = function() {
    $scope.forgot_password_modal.show();
  };

	$scope.requestNewPassword = function() {
    console.log("requesting new password");
  };

  // //Cleanup the modal when we're done with it!
  // $scope.$on('$destroy', function() {
  //   $scope.modal.remove();
  // });
  // // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('modal.removed', function() {
  //   // Execute action
  // });
})

.factory('ID', function () {
    var ID = "";
    return {
	setID: function (pID) {
        $scope.ID = pID;
    },
    getID: function () {
        return ID;
    }
    };
})

.factory('name', function () {
    var name = "";
    return {
	setName: function (pName) {
		name = pName;
        $scope.name = pName;
    },
    getName: function () {
        return name;
    }
    };
})



.controller('LoginCtrl', function (Backand, $state, $rootScope, $scope, LoginService, ID, name) {

	$scope.bgs = ["img/welcome-bg.jpg"];

	var login = this;
	login.facebookToken = '';

	$scope.firebaseFacebookLogIn = function(){
		
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_birthday');
		provider.addScope('public_profile');
		firebase.auth().signInWithRedirect(provider).then(function(msg)
		{
			console.log(msg);
		}).catch(function(err)
		{
			console.log(err);
		});
		
		firebase.auth().getRedirectResult().then(function(result) {
			console.log(result);
  		if (result.credential) {
    		// This gives you a Facebook Access Token. You can use it to access the Facebook API.
    		var token = result.credential.accessToken;
  		}
		
		//var user = firebase.auth().currentUser;
		firebase.auth().onAuthStateChanged(function(user) {
  				if (user) {
    				// User is signed in.
					var user = result.user;
					var uid = user.providerData[0].uid;
					var nombre = user.providerData[0].displayName;
					var ID = 0;
					localStorage.setItem("ID", uid);
					var name = "xxx";
					localStorage.setItem("name", nombre);
					$state.go('app.feed');
  				} else {
    				// No user is signed in.
					alert("No se ha podido obtener el usuario");
  				}
			});
		}).catch(function(error) {
  			// Handle Errors here.
  			 console.log(error);
  			// ...
		});
	};

	$scope.ID = localStorage.getItem("ID");
	$scope.name = localStorage.getItem("name");

	$scope.facebookLogOut = function(token){
		firebase.auth().signOut().then(function() {
  		// Sign-out successful.
		  $state.go('facebook-sign-in');
		}, function(error) {
  		// An error happened.
		});
		
	};


	function signin() {
		LoginService.signin(login.email, login.password)
			.then(function () {
				onLogin();
			}, function (error) {
				console.log(error)
			})
	}

	function loginError(err){
		console.log(err);
	}

	login.facebookTokenSingin = function () {
		console.log('start facebook token');
		var fbLoginSuccess = function (userData) {

			facebookConnectPlugin.getAccessToken(function (token) {

				login.facebookToken = token;

				LoginService.facebookToken(login.facebookToken).then(function (d) {
					login.isLoggedWihtBackand = true;
					login.facebookToken = "Here with Backand InAPP! ";
					login.username = d.username;
					login.role = d.role;
				}, loginError);
			});
		}

		var haveInAppPlugin = false;

		try {
			haveInAppPlugin = facebookConnectPlugin;
		}
		catch (err){

		}

		// facebookConnectPlugin is not defined on desktop
		if(haveInAppPlugin) { // mobile
			facebookConnectPlugin.login(["public_profile", "email"], fbLoginSuccess,
				function (error) {
					console.error(error)
				}
			);
		}
		else { // desktop
			LoginService.socialSignIn('facebook').then(function(){
				var username = Backand.getUsername();
				var userRole = Backand.getUserRole();

				login.isLoggedWihtBackand = true;
				login.facebookToken = "Here with Backand! ";
				login.username = username;
				login.role = userRole;
				console.log(login.username);
				$state.go('app.feed');
			}, loginError)
		}
	}

	function anonymousLogin() {
		LoginService.anonymousLogin();
		onLogin();
	}

	function onLogin() {
		$rootScope.$broadcast('authorized');
		$state.go('tab.dashboard');
	}

	function signout() {
		LoginService.signout()
			.then(function () {
				//$state.go('tab.login');
				$rootScope.$broadcast('logout');
				$state.go($state.current, {}, {reload: true});
			})

	}

	login.signin = signin;
	login.signout = signout;
	login.anonymousLogin = anonymousLogin;


})

.controller('SignUpCtrl', function (Backand, $state, $rootScope, LoginService, $scope) {
	var vm = this;
	$scope.bgs = ["img/welcome-bg.jpg"];

	function signUp() {
		vm.errorMessage = '';
		LoginService.signup(vm.firstName, vm.lastName, vm.email, vm.password, vm.again)
			.then(function (response) {
				// success
				onLogin();
			}, function (reason) {
				if (reason.data.error_description !== undefined) {
					vm.errorMessage = reason.data.error_description;
				}
				else {
					vm.errorMessage = reason.data;
				}
			});

	}

	function signupFacebook() {
		LoginService.socialSignUp('facebook')
			.then(function () {
					onLogin();
				}
				, function (reason) {
					if (reason.data.error_description !== undefined) {
						vm.errorMessage = reason.data.error_description;
					}
					else {
						vm.errorMessage = reason.data;
					}
				});
	}

	function onLogin() {
		$rootScope.$broadcast('authorized');
		$state.go('tabs.dashboard');
	}

	vm.signupFacebook = signupFacebook;
	vm.signup = signUp;
	vm.email = '';
	vm.password = '';
	vm.again = '';
	vm.firstName = '';
	vm.lastName = '';
	vm.errorMessage = '';
})

.controller('ForgotPasswordCtrl', function($scope){

})

;
