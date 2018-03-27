const { getDevice } = require('./helpers/getDevice');
const  BroadlinkA1 = require('./a1');


// 构造函数
function BroadlinkA1Platform(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
  
}

BroadlinkA1Platform.prototype.accessories = function(callback){
    // 构造三个配件
    var accessories = [];
    accessories.push(new BroadlinkA1(this.log,this.config,this.api,"temperature"));
    // accessories.push(new BroadlinkA1(this.log,this.config,this.api,"light"));
    accessories.push(new BroadlinkA1(this.log,this.config,this.api,"humidity"));
    accessories.push(new BroadlinkA1(this.log,this.config,this.api,"airQuality"));
    callback(accessories);// 交给homebridge创建hap的配件并加入到hap桥中
}

module.exports = BroadlinkA1Platform