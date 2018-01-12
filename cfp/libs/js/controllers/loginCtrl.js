/*******************************************
		Controller de Login
*******************************************/
var loginCtrl = function ($scope, $rootScope, $location, authenticationAPI) {

	//verifica sessao
	if($rootScope.usuario) {
		$location.path('/menu');
		return false;
	}
	
	$scope.logar = function (obj) {
		// Encrypt senha
		obj.senha = MD5(obj.senha);
		
		var data = {
			"metodo":"logar",
			"data":obj
		};
		authenticationAPI.authentication(data)
			.then(function successCallback(response) {
	            //se o sucesso === true
				if(response.data.success == true){
	                //criamos a session
	            	authenticationAPI.createSession(response.data.data, obj.infinity);
	                //logion error é escondido
	                $scope.login.error = false;
	                //redirecionamos para home
	                $location.path('/menu');
	            }else{
	                //ativamos o login error com true
	            	$scope.login.error = true;
	            }
	        }, function errorCallback(response) {
	        	//error
			});	
	}
}

angular
	.module('cfp')
	.controller('loginCtrl', loginCtrl);