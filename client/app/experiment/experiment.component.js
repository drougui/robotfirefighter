'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './experiment.routes';

export class ExperimentComponent {
  /*@ngInject*/
  constructor($http, $scope, hotkeys, $timeout, $interval, $rootScope) {
    'ngInject';
    this.message = 'Hello';
    $scope.language = $rootScope.language || 'english';

    // NASA-TLX
    // Create a set of parallel arrays for each of the scales
    var scale      = new Array();
    var left       = new Array();
    var right      = new Array();
    var def        = new Array();
    var NUM_SCALES = 6;



    if($rootScope.language=='english'){
    scale[0]  = "Mental Demand"; 
    left[0]   = "Low";
    right[0]  = "High";
    def[0]    = "How much mental and perceptual activity was required (e.g. thinking, deciding, calculating, remembering, looking, searching, etc)? Was the task easy or demanding, simple or complex, exacting or forgiving?";

    scale[1]  = "Physical Demand"; 
    left[1]   = "Low";
    right[1]  = "High";
    def[1]    = "How much physical activity was required (e.g. pushing, pulling, turning, controlling, activating, etc)? Was the task easy or demanding, slow or brisk, slack or strenuous, restful or laborious?";

    scale[2]  = "Temporal Demand"; 
    left[2]   = "Low";
    right[2]  = "High";
    def[2]    = "How much time pressure did you feel due to the rate of pace at which the tasks or task elements occurred? Was the pace slow and leisurely or rapid and frantic?";

    scale[3]  = "Performance"; 
    left[3]   = "Good";
    right[3]  = "Poor";
    def[3]    = "How successful do you think you were in accomplishing the goals of the task set by the experimenter (or yourself)? How satisfied were you with your performance in accomplishing these goals?";

    scale[4]  = "Effort"; 
    left[4]   = "Low";
    right[4]  = "High";
    def[4]    = "How hard did you have to work (mentally and physically) to accomplish your level of performance?";

    scale[5]  = "Frustration"; 
    left[5]   = "Low";
    right[5]  = "High";
    def[5]    = "How insecure, discouraged, irritated, stressed and annoyed versus secure, gratified, content, relaxed and complacent did you feel during the task?";
    }
    else if($rootScope.language=='french'){
    scale[0]  = "Exigence Mentale"; 
    left[0]   = "Faible";
    right[0]  = "Elevée";
    def[0]    = "Quelle a été l’importance de l’activité mentale et intellectuelle requise (ex. réflexion, décision, calcul, mémorisation, observation, recherche etc.) ? La tâche vous a-t-elle paru simple, nécessitant peu d’attention (faible) ou complexe, nécessitant beaucoup d’attention (élevée) ?";

    scale[1]  = "Exigence Physique"; 
    left[1]   = "Faible";
    right[1]  = "Elevée";
    def[1]    = "Quelle a été l’importance de l’activité physique requise (ex. pousser, porter, tourner, marcher, activer, etc.) ? La tâche vous a-t-elle paru facile, peu fatigante, calme (faible) ou pénible, fatigante, active (élevée) ?";

    scale[2]  = "Exigence Temporelle"; 
    left[2]   = "Faible";
    right[2]  = "Elevée";
    def[2]    = "Quelle a été l’importance de la pression temporelle causée par la rapidité nécessitée pour l'accomplissement de la tâche ? Etait-ce un rythme lent et tranquille (faible) ou rapide et précipité (élevé) ?";

    scale[3]  = "Performance"; 
    left[3]   = "Bonne";
    right[3]  = "Mauvaise";
    def[3]    = "Quelle réussite pensez-vous avoir eu dans l’accomplissement de votre tâche ? Comment pensez-vous avoir atteint les objectifs déterminés par la tâche ? ";

    scale[4]  = "Effort"; 
    left[4]   = "Faible";
    right[4]  = "Elevé";
    def[4]    = "Quel degré d’effort avez-vous dû fournir pour exécuter la tâche demandée, (mentalement et physiquement) ?";

    scale[5]  = "Frustration"; 
    left[5]   = "Faible";
    right[5]  = "Elevée";
    def[5]    = "Pendant l’exécution du travail vous êtes-vous senti satisfait, relaxé, sûr de vous (niveau de frustration faible), ou plutôt découragé, irrité, stressé, sans assurance (niveau de frustration élevé) ?";
    }

    // Pairs of factors in order in the original instructions, numbers
    // refer to the index in the scale, left, right, def arrays.
    var pair  = new Array();
    pair[0]   = "4 3";
    pair[1]   = "2 5";
    pair[2]   = "2 4";
    pair[3]   = "1 5";
    pair[4]   = "3 5";
    pair[5]   = "1 2";
    pair[6]   = "1 3";
    pair[7]   = "2 0";
    pair[8]   = "5 4";
    pair[9]   = "3 0";
    pair[10]  = "3 2";
    pair[11]  = "0 4";
    pair[12]  = "0 1";
    pair[13]  = "4 1";
    pair[14]  = "5 0";

    // Variable where the results end up
    var results_rating = new Array();
    var results_tally  = new Array();
    var results_weight = new Array();
    var results_overall;


    var pair_num = 0;
    for (var i = 0; i < NUM_SCALES; i++)
	results_tally[i] = 0;





    // Used to randomize the pairings presented to the user
    function randOrd()
    {
	return (Math.round(Math.random())-0.5); 
    }

    // Make sure things are good and mixed
    for (i = 0; i < 100; i++)
    {
    	pair.sort(randOrd);
    }

    // They click on a scale entry
    $scope.scaleClick = function(index, val)
    {
	results_rating[index] = val;

	// Turn background color to white for all cells
	for (i = 5; i <= 100; i += 5)
	{
		var top = "t_" + index + "_" + i;
		var bottom = "b_" + index + "_" + i;
		document.getElementById(top).bgColor='#FFFFFF';
		document.getElementById(bottom).bgColor='#FFFFFF';
	}

	var top = "t_" + index + "_" + val;
	var bottom = "b_" + index + "_" + val;
	document.getElementById(top).bgColor='#AAAAAA';
	document.getElementById(bottom).bgColor='#AAAAAA';
    }

    // Return the HTML that produces the table for a given scale
    function getScaleHTML(index)
    {
	var result = "";

	// Outer table with a column for scale, column for definition
	result += '<table><tr><td>';

	// Table that generates the scale
	result += '<table class="scale">';

	// Row 1, just the name of the scale
	result += '<tr><td colspan="20" class="heading">' + scale[index] + '</td></tr>';

	// Row 2, the top half of the scale increments, 20 total columns
	result += '<tr>';
	var num = 1;
	for (var i = 5; i <= 100; i += 5)
	{
		result += '<td id="t_' + index + '_' + i + '"   class="top' + num + '" onMouseUp="scaleClick(' + index + ', ' + i + ');"></td>';
		num++;
		if (num > 2)
			num = 1;
	}
	result += '</tr>';

	// Row 3, bottom half of the scale increments
	result += '<tr>';
	for (var i = 5; i <= 100; i += 5)
	{
		result += '<td id="b_' + index + '_' + i + '"   class="bottom" onMouseUp="scaleClick(' + index + ', ' + i + ');"></td>';
	}
	result += '</tr>';

	// Row 4, left and right of range labels
	result += '<tr>';
	result += '<td colspan="10" class="left">' + left[index] + '</td><td colspan="10" class="right">' + right[index] + '</td>';
	result += '</tr></table></td>';


	// Now for the definition of the scale
	result += '<td class="def">';
	result += def[index];
	result += '</td></tr></table>';

	return result;
    }

    function onLoad()
    {
        console.log("onload!");
	// Get all the scales ready
	for (var i = 0; i < NUM_SCALES; i++)
	{
		document.getElementById("scale" + i).innerHTML = getScaleHTML(i);
	}
    }

    // Users want to proceed after doing the scales
    $scope.buttonPart1 = function()
    {
	// Check to be sure they click on every scale
	for (var i = 0; i < NUM_SCALES; i++)
	{
		if (!results_rating[i])
		{
			alert('A value must be selected for every scale!');
			return false;
		}
	}

	// Bye bye part 1, hello part 2
	document.getElementById('div_part1').style.display = 'none'; 
	document.getElementById('div_part2').style.display = ''; 

	return true;
    }

    // User done reading the part 2 instructions
    $scope.buttonPart2 = function()
    {
	// Bye bye part 2, hello part 3
	document.getElementById('div_part2').style.display = 'none'; 
	document.getElementById('div_part3').style.display = ''; 

	// Set the labels for the buttons
	setPairLabels();
	return true;
    }

    // Set the button labels for the pairwise comparison stage
    function setPairLabels()
    {
	var indexes = new Array();
	indexes = pair[pair_num].split(" ");

	var pair1 = scale[indexes[0]];
	var pair2 = scale[indexes[1]];

	document.getElementById('pair1').value = pair1;
	document.getElementById('pair2').value = pair2;

	document.getElementById('pair1_def').innerHTML = def[indexes[0]];
	document.getElementById('pair2_def').innerHTML = def[indexes[1]];
    }

    // They clicked the top pair button
    $scope.buttonPair1 = function()
    {
	var indexes = new Array();
	indexes = pair[pair_num].split(" ");
	results_tally[indexes[0]]++;	

	nextPair();
	return true;
    }

    // They clicked the bottom pair button
    $scope.buttonPair2 = function()
    {
	var indexes = new Array();
	indexes = pair[pair_num].split(" ");
	results_tally[indexes[1]]++;	
	nextPair();
	return true;
    }

    // Compute the weights and the final score
    function calcResults()
{
	results_overall = 0.0;

	for (var i = 0; i < NUM_SCALES; i++)
	{
		results_weight[i] = results_tally[i] / 15.0;
		results_overall += results_weight[i] * results_rating[i];
	}
    }


    // Output the table of results
    function getResultsHTML()
    {
	var result = "";

	result += "<table><tr><td></td><td>Rating</td><td>Tally</td><td>Weight</td></tr>";
	for (var i = 0; i < NUM_SCALES; i++)
	{
		result += "<tr>";

		result += "<td>";
		result += scale[i];
		result += "</td>";

		result += "<td>";
		result += results_rating[i];
		result += "</td>";

		result += "<td>";
		result += results_tally[i];
		result += "</td>";

		result += "<td>";
		result += results_weight[i];
		result += "</td>";

		result += "</tr>";
	}

	result += "</table>";
	result += "<br/>";
	result += "Overall = ";
	result += results_overall;
	result += "<br/>";

	return result;
    }

    // Move to the next pair
    function nextPair()
    {
	pair_num++;
	if (pair_num >= 15)
	{
		document.getElementById('div_part3').style.display = 'none'; 
		document.getElementById('div_part4').style.display = '';
		calcResults();
		document.getElementById('div_part4').innerHTML = getResultsHTML(); // send to server and write it to a file named with the date	
		var nasaresult = getResultsHTML();
                $http.post('/api/control/nasatlx', {nasatlx: nasaresult}).then(response => {
                  if(response.status === 200) {
                    console.log("nasa sent");
                  }
                });
		
		$http.post('/api/control/markers', {marker: 'nasatlxEnd'}).then(response => {
                  if(response.status === 200){
                    console.log("marker 2 nasatlx sent");
                  }
                })
                location.href='http://192.168.1.2:8080/experiment'; // TODO http://localhost:8080 ou plutot http://192.168.1.2:8080
	}
	else
	{
		setPairLabels();
	}
    }



// -->
    document.getElementById('crossesDiv').style.display = 'none'; 
    document.getElementById('kss').style.display = 'none';
    document.getElementById('div_part1').style.display = 'none';
    document.getElementById('div_part2').style.display = 'none';
    document.getElementById('div_part3').style.display = 'none';
    document.getElementById('div_part4').style.display = 'none';
    document.getElementById('choicepage').style.display = '';

    $scope.rest = false;
    $scope.commencer = function()
    {
      $http.post('/api/control/markers', {marker: 'restBegin'}).then(response => {
        if(response.status === 200){
          console.log("marker 1 sent");
        }
      })
      document.getElementById('consigne').style.display = 'none';
      document.getElementById('commencer').style.display = 'none';
      $scope.rest = true;
      setTimeout(function() {
        console.log("2 sec");
        //location.href='http://localhost:3000'; // TODO http://localhost:8080 ou plutot http://192.168.1.2:8080
        location.href='http://192.168.1.2:8080';
        $http.post('/api/control/markers', {marker: 'restEnd'}).then(response => {
          if(response.status === 200){
            console.log("marker 2 sent");
            $scope.rest = false;
          }
        })
      }, 60000); // TODO 1 minute!
    
    }


    $scope.fixacross = function()
    {
      document.getElementById('crossesDiv').style.display = '';
      document.getElementById('choicepage').style.display = 'none'; 
      document.getElementById('kss').style.display = 'none';
    }

    $scope.nasatlx = function(){
      document.getElementById('crossesDiv').style.display = 'none';
      document.getElementById('choicepage').style.display = 'none';
      document.getElementById('kss').style.display = 'none';
      document.getElementById('div_part1').style.display = '';
      $http.post('/api/control/markers', {marker: 'nasatlxBegin'}).then(response => {
        if(response.status === 200){
          console.log("marker 1 nasatlx sent");
        }
      })
    }

    $scope.kss = function(){
      document.getElementById('crossesDiv').style.display = 'none';
      document.getElementById('choicepage').style.display = 'none';
      document.getElementById('kss').style.display = '';
      $http.post('/api/control/markers', {marker: 'kssBegin'}).then(response => {
        if(response.status === 200){
          console.log("marker 1 nasatlx sent");
        }
      });
    }


    $scope.click1 = function(){
      if (document.getElementById("Response1").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click2 = function(){
      if (document.getElementById("Response2").checked) {
        document.getElementById("Response1").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click3 = function(){
      if (document.getElementById("Response3").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click4 = function(){
      if (document.getElementById("Response4").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click5 = function(){
      if (document.getElementById("Response5").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click6 = function(){
      if (document.getElementById("Response6").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click7 = function(){
      if (document.getElementById("Response7").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click8 = function(){
      if (document.getElementById("Response8").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response1").checked = false;
        document.getElementById("Response9").checked = false;
      }
    }

    $scope.click9 = function(){
      if (document.getElementById("Response9").checked) {
        document.getElementById("Response2").checked = false;
        document.getElementById("Response3").checked = false;
        document.getElementById("Response4").checked = false;
        document.getElementById("Response5").checked = false;
        document.getElementById("Response6").checked = false;
        document.getElementById("Response7").checked = false;
        document.getElementById("Response8").checked = false;
        document.getElementById("Response1").checked = false;
      }
    }

    document.getElementById("Response1").onchange = $scope.click1;
    document.getElementById("Response2").onchange = $scope.click2;
    document.getElementById("Response3").onchange = $scope.click3;
    document.getElementById("Response4").onchange = $scope.click4;
    document.getElementById("Response5").onchange = $scope.click5;
    document.getElementById("Response6").onchange = $scope.click6;
    document.getElementById("Response7").onchange = $scope.click7;
    document.getElementById("Response8").onchange = $scope.click8;
    document.getElementById("Response9").onchange = $scope.click9;

    $scope.saveKss = function(){
      	// Check to be sure they click on every scale
        if(document.getElementById("Response1").checked == false &&
        document.getElementById("Response2").checked == false &&
        document.getElementById("Response3").checked == false &&
        document.getElementById("Response4").checked == false &&
        document.getElementById("Response5").checked == false &&
        document.getElementById("Response6").checked == false &&
        document.getElementById("Response7").checked == false &&
        document.getElementById("Response8").checked == false &&
        document.getElementById("Response9").checked == false ){
          alert('A box must be checked!');
        }
	else{
	  var answer = 0;
          if(document.getElementById("Response1").checked){
            answer = 1;
          }
          if(document.getElementById("Response2").checked){
            answer = 2;
          }
          if(document.getElementById("Response3").checked){
            answer = 3;
          }
          if(document.getElementById("Response4").checked){
            answer = 4;
          }
          if(document.getElementById("Response5").checked){
            answer = 5;
          }
          if(document.getElementById("Response6").checked){
            answer = 6;
          }
          if(document.getElementById("Response7").checked){
            answer = 7;
          }
          if(document.getElementById("Response8").checked){
            answer = 8;
          }
          if(document.getElementById("Response9").checked){
            answer = 9;
          }
          $http.post('/api/control/kss', {kss: answer}).then(response => {
            if(response.status === 200) {
              console.log("kss sent");
            }
            location.href='http://192.168.1.2:8080/experiment';
            $http.post('/api/control/markers', {marker: 'kssEnd'}).then(response => {
              if(response.status === 200){
                console.log("marker 2 kss sent");
              }

            });
          });
          
        }
    }
  }
}

export default angular.module('robotfirefighterApp.experiment', [uiRouter])
  .config(routes)
  .component('experiment', {
    template: require('./experiment.html'),
    controller: ExperimentComponent,
    controllerAs: 'experimentCtrl'
  })
  .name;
