'use strict'

var angular = require('angular')

angular.module('fusioApp.logout', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/logout', {
      templateUrl: 'app/logout/logout.html',
      controller: 'LogoutCtrl'
    })
  }])

  .controller('LogoutCtrl', ['$scope', '$auth', '$location', '$rootScope','SatellizerStorage', function ($scope, $auth, $location, $rootScope,SatellizerStorage) {
    if ($auth.isAuthenticated()) {
      $auth.logout()
      $rootScope.isAuthenticated = $auth.isAuthenticated()
      $rootScope.userName = null
	  $rootScope.tenantId = null
	  $rootScope.tenantRole = null
	  $rootScope.isTenantOwner = false
	  SatellizerStorage.remove('tenantId')
    }

    $location.url('/login')
  }])
