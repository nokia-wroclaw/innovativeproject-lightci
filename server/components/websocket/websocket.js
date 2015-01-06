/**
 * Created by michal on 02.12.14.
 */

function sendProjectStatus(status, progress, projectName) {
  var data = { 'projectName': projectName, 'status': status, 'progress': progress};

  global.webSockets.emit('project_status', data);
}

exports.sendProjectStatus = sendProjectStatus;
