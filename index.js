const BroadlinkRMPlatform = require('./platform')
const BroadlinkSP = require('./sp')
const BroadlinkA1Platform = require('./a1platform')
const { discoverDevices } = require('./helpers/getDevice');

module.exports = (homebridge) => {
  global.Service = homebridge.hap.Service;
  global.Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-broadlink-sirivis", "BroadlinkRM", BroadlinkRMPlatform);
  homebridge.registerAccessory("homebridge-broadlink-sirivis", "BroadlinkSP", BroadlinkSP);
  homebridge.registerPlatform("homebridge-broadlink-sirivis", "BroadlinkA1", BroadlinkA1Platform);
  
  discoverDevices();
}