'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-hotkeys';
// import ngMessages from 'angular-messages';


import {
  routeConfig
} from './app.config';

import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import AboutComponent from './about/about.component';
import welcome from './welcome/welcome.component';
import LoadingComponent from './loading/loading.component';
import HowtoComponent from './howto/howto.component';
import TrainComponent from './train/train.component';
import ScoresComponent from './scores/scores.component';
import VideodemoComponent from './videodemo/videodemo.component';
import ExperimentComponent from './experiment/experiment.component';
import './app.css';

angular.module('videogameApp', [ngCookies, ngResource, ngSanitize, 'btford.socket-io', uiRouter,
  uiBootstrap, navbar, footer, main, welcome, AboutComponent, LoadingComponent, TrainComponent, HowtoComponent, ScoresComponent, VideodemoComponent, ExperimentComponent, constants, socket, util, 'cfp.hotkeys'
]).service('sharedProperties', function () {
        var property = "";
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
    }).config(routeConfig);

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['videogameApp'], {
      strictDi: true
    });
  });
