
const { getDevice } = require('./helpers/getDevice');
const HAPServerStatus = require("./HAPServerStatus").HAPServerStatus;

function BroadlinkSP(log, config, api) {
    var Service = global.Service;
    var Characteristic = global.Characteristic;
    this.log = log;
    this.host = config['host'];
    this.name = config['name'];
    this.powered = false;

    if (!this.host) throw new Error("You must provide a config value for 'host'.");

    this.service = new Service.Switch(this.name);

    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getState.bind(this))
        .on('set', this.setState.bind(this));
 
    this.accessoryInformationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Broadlink')
        .setCharacteristic(Characteristic.Model, 'SP')
        .setCharacteristic(Characteristic.SerialNumber, '1.0')
}

BroadlinkSP.prototype.getState = function(callback) {
    var self = this;
    self.onPowerCb = callback;
    const dev = getDevice({ host, log } = self);

    self.log("getState for SP,host is : " + host);
    if(!dev || dev.state == 'inactive'){ // 未找到设备或状态为非激活
        self.log("getState cannot find SP Device，or state is inactive,host is : " + host);//找不到也要回报
        callback(HAPServerStatus.OPERATION_TIMED_OUT, false);
    }else{
        dev.check_power();// 检查设备状态,如果掉线了怎么办
        if(!dev.addPowerListener){
            dev.on("power", this.onPower().bind(this));
            dev.addPowerListener = true;
        }

        setTimeout(function(){
            if(self.onPowerCb){
                self.onPowerCb(HAPServerStatus.OPERATION_TIMED_OUT,false);
                self.onPowerCb = undefined;
            }
        },5000);
    }
}

BroadlinkSP.prototype.onPower = function(){
    return function(pwr){
        this.log("get sp power, status is on - " + pwr);
        if (!pwr) {
            this.powered = false;
            if(this.onPowerCb){
                this.onPowerCb(null, false);
                this.onPowerCb = undefined;
            }
        } else {
            this.powered = true;
            if(this.onPowerCb){
                this.onPowerCb(null, true);
                this.onPowerCb = undefined;
            }
        }
    };
}

BroadlinkSP.prototype.setState = function(state, callback) {
    var self = this;
    const dev = getDevice({ host, log } = self);
    if(!dev  || dev.state == 'inactive'){ // 未找到设备或状态为非激活
        self.log("setState cannot find SP Device,host is : " + host);
        callback(HAPServerStatus.OPERATION_TIMED_OUT, false);
        return;
    }
    if (state) {// set true
        //if (this.powered) {
        //    return callback(null, true)
        //} else {
            self.log("Set SP to ON!");
            dev.set_power(true);
            this.powered = true;
            return callback(null);
        //}
    } else { // set false
        //if (this.powered) {
            self.log("Set SP to OFF!");
            dev.set_power(false);
            this.powered = false;
            return callback(null);
        //} else {
        //    return callback(null, false)
        //}
    }
}

BroadlinkSP.prototype.getServices = function() {
    return [
        this.service,
        this.accessoryInformationService
    ]
}

module.exports = BroadlinkSP;