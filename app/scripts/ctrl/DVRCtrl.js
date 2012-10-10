function DVRCtrl($scope, $location, $timeout, $rootScope, Recording, Frontend, User) {

  $scope.filterLiveTV = {"Recording.RecGroup": "!LiveTV"};

  $scope.format = 'M/d/yy h:mm:ss a';

  $scope.recordings = Recording.queryList();

  $scope.previousRecording = $rootScope.previousRecording;
  $scope.previousRecordingConfirmNeeded = false;

  $scope.playingRecording = false;

  $scope.clickRecording = function(recording) {
    $scope.playingRecording = true;
    Frontend.playRecording(recording, Frontend.getSelected());
    $rootScope.previousRecording = recording;

    $location.path('/remote');
  }

  $scope.clickDeleteRecording = function() {
    $scope.previousRecordingConfirmNeeded = true;
  }
  $scope.ignorePreviousRecording = function() {
    $scope.resetPreviousRecording();
  }

  $scope.resetPreviousRecording = function() {
    $scope.previousRecordingConfirmNeeded = false;
    $scope.previousRecording = undefined;
  }

  $scope.deleteRecording = function(recording) {
    Recording.deleteRecording(recording, function() {
      $scope.resetPreviousRecording();
      $scope.recordings = Recording.queryList();
    });
  }
  $scope.cancelDeleteRecording = function() {
    $scope.previousRecordingConfirmNeeded = false;
  }

  $scope.monitorStatus = function() {
    var selected = Frontend.getSelected();
    var status = Frontend.getStatus(selected, function() {
      if(status != undefined && status.FrontendStatus != undefined && status.FrontendStatus.State != undefined &&
        status.FrontendStatus.State.state === 'WatchingPreRecorded') {
        $location.path('/remote');
      }
    })
  }

  $scope._monitor = setInterval($scope.monitorStatus, 1000);
  $scope.$on('$destroy', function() { 
    clearInterval($scope._monitor); 
  });

}
