'use strict'

var angular = require('angular')

angular.module('fusioApp.login', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'app/login/login.html',
      controller: 'LoginCtrl'
    })
  }])

  .controller('LoginCtrl', ['$scope', '$http', '$auth', '$location', '$route', '$rootScope', 'SatellizerConfig','SatellizerStorage','fusio', function ($scope, $http, $auth, $location, $route, $rootScope, SatellizerConfig,SatellizerStorage,fusio) {
    $scope.user = {
      username: '',
      password: ''
    }

    if ($auth.isAuthenticated()) {
      $location.path('/profile')
      return
    }

    $scope.authenticate = function (provider) {
      $auth.authenticate(provider)
    }

    $scope.isConfigured = function (provider) {
      return SatellizerConfig.providers[provider] && SatellizerConfig.providers[provider].clientId
    }

    $scope.closeResponse = function () {
      $scope.response = null
    }

    $scope.login = function (user) {
      $auth.login(JSON.stringify(user))
        .then(function () {
          $rootScope.isAuthenticated = $auth.isAuthenticated()
          $rootScope.userName = null
		  $rootScope.tenantId = null
		  $rootScope.tenantRole = null
		  $rootScope.isTenantOwner = false
          var payload = $auth.getPayload()
          if (payload && payload.name) {
            $rootScope.userName = payload.name
			$http.get(fusio.baseUrl + 'consumer/account/',
				{headers: {'Authorization': 'Basic '+$auth.getToken()}}).then(function (response) {
				//console.log('after username=>'+$rootScope.userName)
				$rootScope.tenantId = typeof response.data.attributes.tenant_uid == 'undefined'?null:response.data.attributes.tenant_uid
				$rootScope.tenantRole = typeof response.data.attributes.tenant_role== 'undefined'?null:response.data.attributes.tenant_role
				$rootScope.isTenantOwner = typeof response.data.attributes.tenant_role== 'undefined'?false:response.data.attributes.tenant_role=='owner'
				//console.log('response tenantId=>'+response.data.attributes.tenant_uid)
				console.log('tenantId=>'+$rootScope.tenantId)
				console.log('tenantOwner=>'+$rootScope.isTenantOwner)
				//$auth.Storage.set('tenantId',$rootScope.tenantId)
				SatellizerStorage.set('tenantId',$rootScope.tenantId)
			}, function (response) {
				$scope.error = 'Could not request app tenantId information'
			})
          }

          var params = $location.search()
          if (params && params.auth) {
            var allowedParams = {
              responseType: 'response_type',
              clientId: 'client_id',
              redirectUri: 'redirect_uri',
              scope: 'scope',
              state: 'state'
            }
            var data = JSON.parse(atob(params.auth))
            var parts = []
            for (var key in allowedParams) {
              if (data[key]) {
                parts.push(allowedParams[key] + '=' + encodeURIComponent(data[key]))
              }
            }

            $location.url('/auth?' + parts.join('&'))
          } else {
			console.log('test')
            $route.reload()
          }
        })
        .catch(function (response) {
          $scope.user.password = ''
          $scope.response = response.data
        })
    }
  }])
