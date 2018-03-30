
const { getDevice } = require('./helpers/getDevice');
const HAPServerStatus = require("./HAPServerStatus").HAPServerStatus;

const classTypes = {
    'temperature': "温度",
    'light': "光线",
    'humidity': "湿度",
    'airQuality': "空气质量"
  }
var events = require('events');
  // 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

var A1Data = {"temperature":"0","light":"0","humidity":"0","airQuality":"0"};
function BroadlinkA1(log, config, api,sensorType) {
    var Service = global.Service;
    var Characteristic = global.Characteristic;
    this.log = log;
    this.host = config['host'];
    this.name = (config['name']||"") + classTypes[sensorType];
    this.sensorType = sensorType;

    if (!this.host) throw new Error("You must provide a config value for 'host'.");

    this.temperatureService = new Service.TemperatureSensor(this.name);
    this.airQualitySensorService = new Service.AirQualitySensor(this.name);
    this.humiditySensorService = new Service.HumiditySensor(this.name);
    this.lightSensorService = new Service.LightSensor(this.name);

    this.temperatureService.getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getDeviceData.bind(this));
        
    this.airQualitySensorService.getCharacteristic(Characteristic.AirQuality)
        .on('get', this.getDeviceData.bind(this));

    this.humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', this.getDeviceData.bind(this));

    this.lightSensorService.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
    .on('get', this.getDeviceData.bind(this));
 
    this.accessoryInformationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Broadlink')
        .setCharacteristic(Characteristic.Model, 'A1')
        .setCharacteristic(Characteristic.SerialNumber, '1.0');
    
    
}
BroadlinkA1.prototype.getDeviceData = function(callback) {
    var self = this;
    const dev = getDevice({ host, log } = self);
    this.A1Callbace = callback;
    self.log("A1 getdata["+self.sensorType+"] form host is : " + host);
    
    if(!dev || dev.state == 'inactive'){
        self.log("Cannot find A1 Device,or state is inactice,host is : " + host);//找不到也要回报
        callback(HAPServerStatus.OPERATION_TIMED_OUT, false);
    }else{
        if(!this.addListener){
            eventEmitter.on(this.sensorType,function(data){
                if(this.A1Callbace){
                    this.A1Callbace(null,data);
                    this.A1Callbace = null;
                }
                
            }.bind(this));
            this.addListener = true;
        }
        // callback(null,A1Data[self.sensorType]);
        dev.check_sensors_raw();// 检查设备状态
        if(!dev.addA1GetListener){
            console.log(">>>>>>>>>>");
            dev.on("A1Get", onA1Get);
            dev.addA1GetListener = true;
        }
        
    }
    
}
function onA1Get(data) {
    A1Data = data;
    // console.log(">>>>>>>>"+data['airQuality']+"<<<<<<<");
    eventEmitter.emit("temperature",data['temperature']);
    // eventEmitter.emit("light",data['light']);
    eventEmitter.emit("humidity",data['humidity']);
    eventEmitter.emit("airQuality",parseInt(data['airQuality'],10)+1);
}
BroadlinkA1.prototype.getServices = function() {
    if(this.sensorType == "temperature"){
        return [this.temperatureService,this.accessoryInformationService];
    }else if(this.sensorType == "light"){
        return [this.lightSensorService,this.accessoryInformationService];
    }else if(this.sensorType == "humidity"){
        return [this.humiditySensorService,this.accessoryInformationService];
    }else if(this.sensorType == "airQuality"){
        return [this.airQualitySensorService,this.accessoryInformationService];
    }
}

module.exports = BroadlinkA1;