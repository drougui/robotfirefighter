'use strict';

export function routeConfig($urlRouterProvider, $locationProvider) {
  'ngInject';

/*  $urlRouterProvider.when('/about','/about');*/
  $urlRouterProvider.otherwise('/welcome');

  $locationProvider.html5Mode(true);
}
