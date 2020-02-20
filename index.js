const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const topic = 'temperatureSensors';
const weigth = require('./app/worker/average');

// ================================================================
// Subscribe to broker topic
client.on('connect', () => {
   client.subscribe(topic);
});

// ================================================================
// Call job to worker
client.on('message', (topic, data) => {
  message = JSON.parse(data);
  weigth(message);
});