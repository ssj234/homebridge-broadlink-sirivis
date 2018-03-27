const { HomebridgePlatform } = require('homebridge-platform-helper');

const npmPackage = require('./package.json');
const Accessory = require('./accessories');
// const checkForUpdates = require('./helpers/checkForUpdates') // 检查版本
// 主要关注aircon，ir code switch light window-covering
const classTypes = {
  'air-conditioner': Accessory.AirCon,
  'learn-ir': Accessory.LearnCode,
  'learn-code': Accessory.LearnCode,
  'switch': Accessory.Switch,
  'garage-door-opener': Accessory.GarageDoorOpener,
  'lock': Accessory.Lock,
  'switch-multi': Accessory.SwitchMulti,
  'switch-multi-repeat': Accessory.SwitchMultiRepeat,
  'switch-repeat': Accessory.SwitchRepeat,
  'fan': Accessory.Fan,
  'outlet': Accessory.Outlet,
  'light': Accessory.Light,
  'window-covering': Accessory.WindowCovering,
}

const BroadlinkRMPlatform = class extends HomebridgePlatform {

  showMessage () {
    const { config } = this;

    if (true||config && (config.hideWelcomeMessage || config.isUnitTest)) return;

    setTimeout(() => {
      console.log('')
      console.log(`**************************************************************************************************************`)
      console.log(`** Welcome to version \x1b[32m${npmPackage.version}\x1b[0m of the \x1b[34mHomebridge Broadlink RM Plugin\x1b[0m!`)
      console.log('')
      console.log(`** Find out what's in the latest release here: \x1b[4mhttps://github.com/lprhodes/homebridge-broadlink-rm/releases\x1b[0m`)
      console.log(`** `)
      console.log(`** If you like this plugin then please star it on GitHub or better yet buy me a drink using Paypal \x1b[4mhttps://paypal.me/lprhodes\x1b[0m or crypto \x1b[4mhttps://goo.gl/bEn1RW\x1b[0m.`)
      console.log(`** `)
      console.log(`** Keep up to date with this plugin along with everything HomeKit and homebridge`)
      console.log(`** by signing up to my newsletter at \x1b[4mhttp://workswith.io\x1b[0m`)
      console.log(`**`)
      console.log(`** You can disable this message by adding "hideWelcomeMessage": true to the config (see config-sample.json).`)
      console.log(`**`)
      console.log(`**************************************************************************************************************`)
      console.log('')
    }, 1500)
  }

  addAccessories (accessories) {
    const { config, log } = this;

    this.showMessage();
    // setTimeout(checkForUpdates, 1800); // 检查github的版本

    if (!config.accessories) config.accessories = []

    // Add a Learn Code accessory if none exist in the config
    const learnIRAccessories = (config && config.accessories && Array.isArray(config.accessories)) ? config.accessories.filter((accessory) => (accessory.type === 'learn-ir' || accessory.type === 'learn-code')) : [];

    if (learnIRAccessories.length === 0) {

      if (!config.hideLearnButton) { // 不隐藏学习红外按钮
        const learnCodeAccessory = new Accessory.LearnCode(log, { name: 'Learn', scanFrequency: false,host:config.host });
        accessories.push(learnCodeAccessory);
      }

      if (!config.hideScanFrequencyButton) { // 不隐藏扫频按钮
        const scanFrequencyAccessory = new Accessory.LearnCode(log, { name: 'Scan Frequency', scanFrequency: true ,host:config.host});
        accessories.push(scanFrequencyAccessory);
      }
    }

    // Itterate through the config accessories
    var platformConfig = config;
    config.accessories.forEach((accessory) => { 
      if (!accessory.type) throw new Error(`Each accessory must be configured with a "type". e.g. "switch"`);

      if (!classTypes[accessory.type]) throw new Error(`homebridge-broadlink-rm doesn't support accessories of type "${accessory.type}".`);

      const homeKitAccessory = new classTypes[accessory.type](log, accessory,undefined,platformConfig);

      accessories.push(homeKitAccessory); // 根据config添加配件
    })
  }
}

module.exports = BroadlinkRMPlatform
