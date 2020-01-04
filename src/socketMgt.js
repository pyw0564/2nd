module.exports = (function() {
  var io;

  function setServer(server) {
    io = require('socket.io')(server);
  }

  function getIO() {
    return io;
  }
  return {
    setServer,
    getIO
  }
})()
