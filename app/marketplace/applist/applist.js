'use strict'

var angular = require('angular')

angular.module('fusioApp.marketplace.applist', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/marketplace', {
      templateUrl: 'app/marketplace/applist/applist.html',
      controller: 'MarketplaceApplistCtrl'
    })
  }])

  .controller('MarketplaceApplistCtrl', ['$scope', '$http', '$uibModal', '$auth', '$location', 'fusio', function ($scope, $http, $uibModal, $auth, $location, fusio) {
    $scope.apps = []

    if (!$auth.isAuthenticated()) {
      $location.path('/login')
      return
    }

    $scope.load = function () {
      $http.get(fusio.baseUrl + 'tenancy/apps').then(function (response) {
		//var dummyData = {'result':[{'id':1,'name':'member1','email':'member1@email.com','apps':['gl','pos'],'status':'active'}]};
        $scope.apps = response.data.entry
      })
    }

    $scope.install = function (app) {
      var data = angular.copy(app)

      $http.put(fusio.baseUrl + 'tenancy/apps/install/'+app.name, data).then(function (response) {
        $scope.response = response.data
        if (response.data.success === true) {
           //$uibModalInstance.close()
		   $scope.load()
        }
      }, function (response) {
        $scope.response = response.data
      })
    }
	
	$scope.uninstall = function (app) {
      var data = angular.copy(app)

      if (confirm('Do you really want to uninstall this App? (This action will automatically DELETE all app database)')) {

		  $http.put(fusio.baseUrl + 'tenancy/apps/uninstall/'+app.name, data).then(function (response) {
			$scope.response = response.data
			if (response.data.success === true) {
			  //$uibModalInstance.close()
			  $scope.load()
			}
		  }, function (response) {
			$scope.response = response.data
		  })
	  }
    }

    $scope.showAppDetail = function (app) {
      $uibModal.open({
        size: 'md',
        backdrop: 'static',
        templateUrl: 'app/marketplace/applist/detail.html',
        controller: 'MarketplaceApplistDetailCtrl',
        resolve: {
          app: function () {
            return app
          }
        }
      })
    }

    

    $scope.load()
  }])

  

  .controller('MarketplaceApplistDetailCtrl', ['$scope', '$http', '$uibModalInstance', 'app', 'fusio', function ($scope, $http, $uibModalInstance, app, fusio) {
    $scope.app = app

    $http.get(fusio.baseUrl + 'tenancy/backoffice/applist/' + app.id).then(function (response) {
      $scope.app = response.data
    })

    $scope.close = function () {
      $uibModalInstance.dismiss('cancel')
    }
  }])
