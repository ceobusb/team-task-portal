let io = null;

const setSocketServer = (socketIoInstance) => {
  io = socketIoInstance;
};

const getSocketServer = () => {
  return io;
};

module.exports = {
  setSocketServer,
  getSocketServer,
};
