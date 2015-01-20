/**
 * Created by michal on 02.12.14.
 */

function sendProjectStatus(status, progress, projectName) {
  var data = {'projectName': projectName, 'status': status, 'progress': progress};

  global.webSockets.emit('project_status', data);
}

function sendBuildQueueChange(change, projectName) {
  var data = {'change': change, 'projectName': projectName};

  global.webSockets.emit('build_queue_change', data);
}

module.exports = {
  sendProjectStatus : sendProjectStatus,
  sendBuildQueueChange:sendBuildQueueChange
};
