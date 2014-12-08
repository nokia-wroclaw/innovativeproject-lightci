/**
 * Created by jacek-stachurski on 17.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('BuildTableCtrl', function ($scope, $http, $routeParams, $location) {
    $scope.builds = [];
    $scope.project_name = $routeParams.project_name;

    $scope.baseUrl = '#' + $location.path();
    $scope.chartSeries=[];
    $http.get('/api/builds', {params: {project_id: $routeParams.project_id}}).success(function (build) {
      $scope.builds = build;
      var successed = _.filter(build,function(b){
        return b.build_status==="success";
      });
      successed = _.map(successed,function(item){
        return [item.build_date,item.build_status];
      });
      successed = _.countBy(successed,function(item){
        return item[0].toString().substring(0,10);
      });
      var successedTab=[];
      for(var key in successed) {
        successedTab.push([key,successed[key]]);
      }

      var failed = _.filter(build,function(b){
        return b.build_status==="fail";
      });
      failed = _.map(failed,function(item){
        return [item.build_date,item.build_status];
      });
      failed = _.countBy(failed,function(item){
        return item[0].toString().substring(0,10);
      });
      var failedTab=[];
      for(var key in failed) {
        failedTab.push([key,failed[key]]);
      }
      $scope.chartSeries.push({
        name:"success",
        data: successedTab
    });
      $scope.chartSeries.push({
        name:"fail",
        data: failedTab
      });

  });

$scope.chartConfig = {
  "options": {
    "chart": {
      "type": "areaspline",
      "backgroundColor": "#000"
    },
    "plotOptions": {
      "series": {
        "stacking": ""
      }
    }
  },
  "series": $scope.chartSeries,
  "title": {
    "text": "Build history"
  },
  "credits": {
    "enabled": false
  },
  "loading": false,
  "size": {}
}
});
