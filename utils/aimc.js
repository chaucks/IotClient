// Alibaba IOT Mqtt client
const crypto = require('hex_hmac_sha1.js')
let mqtt = require('mqtt.min.js')
const util = require('util.js')

const device = {
  productKey: "替换",
  deviceName: "替换",
  deviceSecret: "替换",
  regionId: "cn-shanghai"
}

const topicPrefix = '/' + device.productKey + '/' + device.deviceName + '/user';

let client = mqtt.connect('wxs://productKey.iot-as-mqtt.cn-shanghai.aliyuncs.com', getOptions())
client._connect = function(topic, callback) {
  client.on('connect', function () {
    var topic =  topicPrefix + '/' + topic;
    client.subscribe(topic, function (err) {
      if (err) {
        return
      }
      console.log('connection success')
    })
    client.on('message', function (topic, message) {
      callback(topic, message);
    })
  })
}

client._publish = function(topic_, message) {
  let topic = topicPrefix + '/' + topic_
  client.publish(topic, message)
}

/**
 * Get mqtt connection options.
 */
function getOptions() {
  const params = {
    clientId: Math.random().toString(36).substr(2),
    productKey: device.productKey,
    deviceName: device.deviceName,
    timestamp: Date.now()
  }
  const options = {
    protocolVersion: 4,
    keepalive: 60,
    clean: true
  }

  options.password = signHmacSha1(params, device.deviceSecret);
  options.clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
  options.username = `${params.deviceName}&${params.productKey}`;

  return options;
}

/**
 * Crypto.
 */
function signHmacSha1(params, deviceSecret) {
  let keys = Object.keys(params).sort();
  keys = keys.sort();
  const list = [];
  keys.map((key) => {
    list.push(`${key}${params[key]}`);
  });
  const contentStr = list.join('');
  return crypto.hex_hmac_sha1(deviceSecret, contentStr);
}

exports._client = client || {};
