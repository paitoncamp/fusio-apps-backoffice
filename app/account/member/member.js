'use strict'

var angular = require('angular')

angular.module('fusioApp.account.member', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/account/member', {
      templateUrl: 'app/account/member/member.html',
      controller: 'AccountMemberCtrl'
    })
  }])

  .controller('AccountMemberCtrl', ['$scope', '$http', '$uibModal', '$auth', '$location', 'fusio', function ($scope, $http, $uibModal, $auth, $location, fusio) {
    $scope.members = []

    if (!$auth.isAuthenticated()) {
      $location.path('/login')
      return
    }

    $scope.load = function () {
      $http.get(fusio.baseUrl + 'tenancy/member').then(function (response) {
		//var dummyData = {'result':[{'id':1,'name':'member1','email':'member1@email.com','apps':['gl','pos'],'status':'active'}]};
        $scope.members = response.data.entry
      })
    }

    $scope.addMember = function () {
      var modalInstance = $uibModal.open({
        size: 'md',
        backdrop: 'static',
        templateUrl: 'app/account/member/create.html',
        controller: 'AccountMemberCreateCtrl'
      })

      modalInstance.result.then(function (response) {
        //do logic
		$scope.load()
      }, function () {
		  
      })
    }

    $scope.showMember = function (member) {
      var modalInstance = $uibModal.open({
        size: 'md',
        backdrop: 'static',
        templateUrl: 'app/account/member/detail.html',
        controller: 'AccountMemberDetailCtrl',
        resolve: {
          member: function () {
            return member
          }
        }
      })
	  
	  modalInstance.result.then(function (response) {
		  //console.log(response)
			$scope.load()
	  }, function () {
		  
      })
    }

    $scope.deleteMember = function (member) {
      if (confirm('Do you really want to delete the member?')) {
        $http.delete(fusio.baseUrl + 'tenancy/member/' + member.id).then(function (response) {
          $scope.load()
        })
      }
    }

    $scope.load()
  }])

  .controller('AccountMemberCreateCtrl', ['$scope', '$http', '$uibModalInstance', 'fusio', function ($scope, $http, $uibModalInstance, fusio) {
    $scope.member = {
      name: '',
	  firstName: '',
	  lastName: '',
      email: '',
	  tenantRole: 'member',
	  roleId:0,
	  status:0,
	  password:'',
      scopes: []
    }
    $scope.scopes = []

    $http.get(fusio.baseUrl + 'consumer/scope').then(function (response) {
      $scope.scopes = response.data.entry
    })

    $scope.create = function (member) {
      var data = angular.copy(member)
	  //TO DO : check passowrd,and check a member or owner which is still bug , member can add a member
	  if(data.newPassword!==data.verifyPassword){
		  //$scope.response = "Password not match"
		  return confirm('Password did not match!')
	  } else {
		  data.password=data.newPassword
	  }
      // filter scopes
      if (data.scopes && angular.isArray(data.scopes)) {
        data.scopes = data.scopes.filter(function (value) {
          return value !== null && value !== undefined
        })
      }

      $http.post(fusio.baseUrl + 'tenancy/member', data).then(function (response) {
        $scope.response = response.data
        if (response.data.success === true) {
          $uibModalInstance.close()
        }
      }, function (response) {
        $scope.response = response.data
      })
    }

    $scope.close = function () {
      $uibModalInstance.dismiss('cancel')
    }

    $scope.closeResponse = function () {
      $scope.response = null
    }
  }])

  .controller('AccountMemberDetailCtrl', ['$scope', '$http', '$uibModalInstance', 'member', 'fusio', function ($scope, $http, $uibModalInstance, member, fusio) {
    $scope.member = member
	
	$scope.load=function(member_id){
		$http.get(fusio.baseUrl + 'tenancy/member/' + member_id).then(function (memberresponse) {
			$scope.member = memberresponse.data
			$http.get(fusio.baseUrl+ 'tenancy/ownerapps/' + member_id).then(function(ownerappsresponse){
				$scope.member.ownerapps = ownerappsresponse.data.entry
			})
		
		})
		
	}
	
    
	
	$scope.update = function (member) {
	  var data = {}
	  var attr = {}
	  /* user can change password by himself 
	  if(member.newPassword!==member.verifyPassword){
		  //$scope.response = "Password not match"
		  return $scope.response={success:false, message:'Password did not match!'}
	  } else {
			if(member.newPassword===null){
				 return $scope.response={success:false, message:'Password must not empty!'} 
			} else {
				data.password=member.newPassword
			}
		  
		  
	  }*/
	  data.id=member.id
	  data.email=member.email
	  data.role_id=member.role_id 
	  data.status=member.status 
	  data.name=member.name
	  //data.provider=member.provider 
	  attr.first_name=member.first_name 
	  attr.last_name=member.last_name 
	  //attr.tenant_role=member.tenant_role 
	  data.attributes=attr
      $http.put(fusio.baseUrl + 'tenancy/member/'+member.id, data).then(function (response) {
        $scope.response = response.data
        $scope.close()
      })
    }

    $scope.closeResponse = function () {
      $scope.response = null
    }

    $scope.close = function () {
      //$uibModalInstance.dismiss('cancel')
	  $uibModalInstance.close()
    }
	
	$scope.enableAppToMember=function(tenantApp,member_id){
		$http.put(fusio.baseUrl+ 'tenancy/ownerapps/install/'+tenantApp.name+'/'+ member_id).then(function(response){
			if(response.data.success===false){
				$scope.response=response.data
			} else {
				$scope.load(member_id)
			}
			
		})
	}
	
	$scope.disableAppFromMember=function(tenantApp,member_id){
		$http.put(fusio.baseUrl+ 'tenancy/ownerapps/uninstall/'+tenantApp.name+'/'+ member_id).then(function(response){
			if(response.data.success===false){
				$scope.response=response.data
			} else {
				$scope.load(member_id)
			}
			
		})
	}
	
	$scope.load(member.id);
  }])
