'use strict';

var app = angular.module('countyMap', ['datamaps']);

app.controller('mapController', function($scope) {

  //Configure the datamap object.
  $scope.tennessee = {
    scope: 'tn_counties',
    geographyConfig: {
      dataUrl: '/topo_tn_counties.json',
      highlightOnHover: false
    },
    mapOptions: {},
    options: {
      staticGeoData: true
    },
    fills: $scope.fills || {
      'selected': '#a55',
      'defaultFill': '#cdcdcd'
    },
    data: {},
    setProjection: function(element, options) {
      var offsetWidth = -100;
      var offsetHeight = 100;

      var projection = d3.geo.mercator()
          .center([-86.7833, 36.1667])
          .scale(5000)
          .rotate([8, 0])
          .translate([0, 100]);

      var path = d3.geo.path().projection(projection);

      return {
        path: path,
        projection: projection
      };
    }
  };

  //Registers a listener on the selectedCounties list. TODO refactor code and
  //unregister listener on $destory.
  var unregister = $scope.$watch('selectedCounties', function(newVal, oldVal) {
    var newNames = _.pluck(newVal, $scope.key);
    var oldNames = _.pluck(oldVal, $scope.key);
    var longerCollection = newNames.length > oldNames.length ? newNames : oldNames;
    var shorterCollection = oldNames.length < newNames.length ? oldNames : newNames;
    var difference = _.difference(longerCollection, shorterCollection);
    $scope.colorCounty(difference[0]);
  }, true);

  //Handles the coloring of the map. TODO should we allow for single county
  //and multiple county selection?
  $scope.colorCounty = function(countyName) {
    var countyNotSelected = _.filter($scope.selectedCounties, function(county) {
      return county[$scope.key] === countyName;
    });
    if (!!countyNotSelected.length) {
      $scope.tennessee.data[countyName] = { 'fillKey': 'selected' };
    } else {
      $scope.tennessee.data[countyName] = { 'fillKey': 'defaultFill' };
    }
  };

  //Updates selectedCounties. TODO refactor and update if we are allowing
  //single county selection. Also need to handle possibilty that $scope.counties
  //comes in a casing that is inconsistent with our own.
  $scope.toggleCounty = function(geography) {
    var countyNotSelected = _.filter($scope.selectedCounties, function(county) {
      return county[$scope.key] === geography.id;
    });
    var clickedCounty = _.find($scope.counties, function(county) {
      return county[$scope.key] === geography.id;
    });
    var idx = $scope.selectedCounties.indexOf(clickedCounty);
    if (!!countyNotSelected.length)
      $scope.selectedCounties.splice(idx, 1);
    else
      $scope.selectedCounties.push(clickedCounty);
    $scope.$apply();
  }
});

app.directive('countyMap', function() {
  return {
    restrict: 'EA',
    controller: 'mapController',
    template: '<datamap map="tennessee"' +
                 'on-click="toggleCounty"></datamap>',
    scope: {
      'selectedCounties': '=',
      'key': '@',
      'counties': '=',
      'fills': '='
    }
  };
});
