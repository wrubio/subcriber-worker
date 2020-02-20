const Redis = require("ioredis");
const Queue = require('bull');
const average = new Queue('worker');

// ================================================================
// Redis connection
const REDIS_PORT = process.env.PORT || 6379;
const redis = new Redis({
  port: REDIS_PORT,
  host: "127.0.0.1",
  db: 0,
  retryStrategy: function(times) {
    return Math.min(Math.exp(times), 20000);
  }
});

// ================================================================
// Creation of object with sensor values and average of temperature
function averageProcess(message) {
  return new Promise((res, rej) => {
    let result = 0;
    const newValues = [];

    Object.keys(message).forEach((key, i) => {
      result += +message[key];
    });

    Object.keys(message).forEach((key, i) => {
      newValues.push({
        sensor: key,
        measure: 'Temperature',
        unit: 'Celsius',
        value: message[key],
        avarage: result/4, 
        timestamp: Date.now(),
      });
    });

    res(newValues);
  });
}

// ================================================================
// Method to process the queue job
average.process(async (job) => {
  return averageProcess(job.data);
});

// ================================================================
// Save object in redis key (sensor_data:*) after job end
average.on('completed', async (job) => {
  try {
    await redis.set(`sensor_data:${job.id}`, JSON.stringify(job.returnvalue));
    console.log(JSON.stringify(job.returnvalue));
  } catch(err) {
    console.log(err);
  }
});

// ================================================================
// Asign new jobs after recive new message to Redis
async function weigth(values) {
  average.add(values);
}

module.exports = weigth;