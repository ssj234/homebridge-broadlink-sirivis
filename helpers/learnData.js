const { getDevice } = require('./getDevice');

let closeClient = null;
let timeout = null;
let getDataTimeout = null;

const stop = (log) => {
  // Reset existing learn requests
  if (!closeClient) return;

  closeClient();
  closeClient = null;

  log(`Learn Code (stopped)`);
}

const start = (host, callback, turnOffCallback, log, disableTimeout) => {
  stop()

  // Get the Broadlink device
  const device = getDevice({ host, log, learnOnly: true });
  if (!device) {
    callback("Error",false);
    log(`Learn Code (Cannot device at ${host})`);
    return "ERROR";
  }
  if (!device.enterLearning) {
    callback("Error",false);
    log(`Learn Code (IR learning not supported for device at ${host})`);
    return "ERROR"
  }
  let onRawData;

  closeClient = (err) => {
    if (timeout) clearTimeout(timeout);
    timeout = null;

    if (getDataTimeout) clearTimeout(getDataTimeout);
    getDataTimeout = null;

    device.removeListener('rawData', onRawData);
  };

  onRawData = (message) => {
    if (!closeClient) return; // 已经stop()

    const hex = message.toString('hex');
    log(`Learn Code (learned hex code: ${hex})`);
    log(`Learn Code (complete)`);

    closeClient();// 关闭

    turnOffCallback();// char.on false
  };

  device.on('rawData', onRawData);

  device.enterLearning()
  log(`Learn Code (ready)`);

  if (callback) callback(); // 打开之后就返回了

  getDataTimeout = setTimeout(() => {
    getData(device);// 1s后checkData()
  }, 1000)

  if (disableTimeout) return;

  // Timeout the client after 10 seconds
  timeout = setTimeout(() => {
    log('Learn Code (stopped - 10s timeout)');
    if (device.cancelRFSweep) device.cancelRFSweep();

    closeClient();

    turnOffCallback();
  }, 10000); // 10s
}

const getData = (device) => {
  if (getDataTimeout) clearTimeout(getDataTimeout);
  if (!closeClient) return;

  device.checkData()

  getDataTimeout = setTimeout(() => {
    getData(device);
  }, 1000);
}

module.exports = { start, stop }
