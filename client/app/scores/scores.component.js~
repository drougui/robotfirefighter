'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './scores.routes';

export class ScoresComponent {
  /*@ngInject*/
  constructor($scope,$http,$rootScope) {
    'ngInject';
    $scope.language = $rootScope.language;
    var pagesNumber = 0;
    $scope.divleft = [];
    $scope.divright = [];
    $scope.firstPage = true;
    $scope.lastPage = false;
    $scope.pageNumber = 1;
    $http.get('/api/control/scores').then(response => {
      if(response.status === 200) {
        $scope.currentScores = JSON.parse(response.data);
	/* we split the scores into sets of 10 scores */
	$scope.pagesArray = [];
        for(var i = 0; i < $scope.currentScores.length; i++) {
	  if(i%10==0){
            pagesNumber = pagesNumber + 1;
            //console.log($scope.currentScores);
            console.log($scope.currentScores.length);
            $scope.pagesArray[pagesNumber-1] = [];
          }
          $scope.pagesArray[pagesNumber-1][i%10] = $scope.currentScores[i];
        }
        console.log($scope.pagesArray.length)
	// first page in center
        $scope.divleft.push(false);
        $scope.divright.push(false);
	// no page on the left
	// all the pages on the right (but not the first)
        for(var i = 1; i<pagesNumber; i++){
          $scope.divright.push(true);
          $scope.divleft.push(false);
        }
          $scope.firstPage = true;
          $scope.lastPage = false;
      }
    });
    this.message = 'Hello';
    $scope.nextPage =function(){
      console.log("next page");
      var pageInd = 0;
      while($scope.divleft[pageInd]){
        pageInd = pageInd + 1;
      }
      if(pageInd+1<pagesNumber){
        $scope.divleft[pageInd] = true;
        $scope.divright[pageInd+1] = false;
        $scope.pageNumber = $scope.pageNumber + 1;
      }
      $scope.firstPage =false;
      if(pageInd+2==pagesNumber){
        $scope.lastPage = true;
      }
    };

    $scope.previousPage = function(){
      console.log("previous page");
      var pageInd = 0;
      while($scope.divleft[pageInd]){
        pageInd = pageInd + 1;
      }
      if(pageInd>0){
        $scope.divright[pageInd] = true;
        $scope.divleft[pageInd-1] = false;
        $scope.pageNumber = $scope.pageNumber - 1;
      }
      $scope.lastPage =false;
      if(pageInd==1){
        $scope.firstPage = true;
      }
    };
  
  }
  
}

export default angular.module('robotfirefighterApp.scores', [uiRouter])
  .config(routes)
  .component('scores', {
    template: require('./scores.html'),
    controller: ScoresComponent,
    controllerAs: 'scoresCtrl'
  })
  .name;
