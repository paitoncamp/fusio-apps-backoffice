'use strict'

var angular = require('angular')

angular.module('fusioApp.marketplace.installed', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/marketplace/installed', {
      templateUrl: 'app/marketplace/installed/installed.html',
      controller: 'MarketplaceInstalledCtrl'
    })
  }])

  .controller('MarketplaceInstalledCtrl', ['$scope', '$http', '$uibModal', '$auth', '$location', 'fusio', function ($scope, $http, $uibModal, $auth, $location, fusio) {
    $scope.apps = []

    if (!$auth.isAuthenticated()) {
      $location.path('/login')
      return
    }

    $scope.load = function () {
      $http.get(fusio.baseUrl + 'tenancy/backoffice/applist/installed').then(function (response) {
		//var dummyData = {'result':[{'id':1,'name':'member1','email':'member1@email.com','apps':['gl','pos'],'status':'active'}]};
        $scope.apps = response.data.entry
      })
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

    $scope.uninstallApp = function (app) {
      if (confirm('Do you really want to uninstall this app?')) {
        $http.delete(fusio.baseUrl + 'tenancy/backoffice/applist/' + app.id).then(function (response) {
          $scope.load()
        })
      }
    }

    $scope.load()
  }])

  

  .controller('MarketplaceInstalledDetailCtrl', ['$scope', '$http', '$uibModalInstance', 'app', 'fusio', function ($scope, $http, $uibModalInstance, app, fusio) {
    $scope.app = app

    $http.get(fusio.baseUrl + 'tenancy/backoffice/applist/' + app.id).then(function (response) {
      $scope.app = response.data
    })

    $scope.close = function () {
      $uibModalInstance.dismiss('cancel')
    }
  }])
