const ping = require('ping');
const BroadlinkJS = require('broadlink-js-smth');
const broadlink = new BroadlinkJS()

const pingFrequency = 5000;

const startPing = (device) => { //5s ping一次
  device.state = 'unknown';

  setInterval(() => {
    ping.sys.probe(device.host.address, (active) => {
      if (!active && device.state === 'active') {
        console.log(`Broadlink RM device at ${device.host.address} (${device.host.macAddress || ''}) is no longer reachable.`);

        device.state = 'inactive';
      } else if (active && device.state !== 'active') {
        if (device.state === 'inactive') console.log(`Broadlink RM device at ${device.host.address} (${device.host.macAddress || ''}) has been re-discovered.`);

        device.state = 'active';
      }
    })
  }, pingFrequency);
}

const discoveredDevices = {};
const manualDevices = {};

let discovering = false;

const discoverDevices = (count = 0) => {
  discovering = true;

  if (count >= 5) {
    discovering = false;
    return;
  }

  broadlink.discover(null,["255.255.255.255"]);
  count++;

  setTimeout(() => {
    discoverDevices(count);
  }, 10 * 1000)
}

broadlink.on('deviceReady', (device) => {
  device.host.macAddress = device.mac

  console.log(`Discovered Broadlink device at ${device.host.address} (${device.host.macAddress}),type is ${device.type}`)
  if(device.type.indexOf("rm") != -1 ||device.type.indexOf("RM") != -1){
    console.log(`Discovered Broadlink RM device at ${device.host.address} (${device.host.macAddress})`)
  }
  var addFlag = addDevice(device); // 添加到discoveredDevices中
  if(addFlag){
    startPing(device);
  }
})

const addDevice = (device) => {
  var lower = device.host.macAddress.toLowerCase();
  var upper = device.host.macAddress.toUpperCase();
  if ( discoveredDevices[device.host.address] 
    || discoveredDevices[lower]
    || discoveredDevices[upper]){
    return false;
  }

  discoveredDevices[device.host.address] = device;
  // discoveredDevices[device.host.macAddress] = device;
  discoveredDevices[lower] = device;
  discoveredDevices[upper] = device;
  return true;
}

const getDevice = ({ host, log, learnOnly }) => {
  let device;

  if (host) { // 肯定需要 设置host的
    device = discoveredDevices[host];

    // Create manual device
    if (!device && !manualDevices[host]) { // 没有找到，也不在手动里面，则加入手动设备
      const device = { host: { address: host } };
      manualDevices[host] = device;
      startPing(device)
    }
  } else { // use the first one of no host is provided
    /*const hosts = Object.keys(discoveredDevices);
    if (hosts.length === 0) {
      // log(`Send data (no devices found)`);

      return;
    }

    // Only return device that can Learn Code codes
    if (learnOnly) {
      for (let i = 0; i < hosts.length; i++) {
        let currentDevice = discoveredDevices[hosts[i]];

        if (currentDevice.enterLearning) {
          device = currentDevice

          break;
        }
      }

      if (!device) log(`Learn Code (no device found at ${host})`);
    } else {
      device = discoveredDevices[hosts[0]];

      if (!device) log(`Send data (no device found at ${host})`);
    }*/
  }

  return device;
}

module.exports = { getDevice, discoverDevices, addDevice };
