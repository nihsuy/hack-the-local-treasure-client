// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngResource', 'uiGmapgoogle-maps', 'ngMockE2E'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$stateProvider', '$urlRouterProvider', 'uiGmapGoogleMapApiProvider', function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
  window.hotarea = {};

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl',
      resolve: {
        commonDataServicePromise: function(commonDataService) {
          return commonDataService.promise;
        }
      }
    });

  $urlRouterProvider.otherwise('/');

  uiGmapGoogleMapApiProvider.configure({
    key: 'API KEY for Google Map',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization',
    language: 'ja'
  });
}])

.directive('resize', function($rootScope, $window) {
  angular.element($window).bind('resize', function() {
    $rootScope.$broadcast('resize');
  });
});