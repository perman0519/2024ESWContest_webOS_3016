const initializeApp = require('firebase/app').initializeApp;
const getDatabase = require('firebase/database').getDatabase;
const ref = require('firebase/database').ref;
const set = require('firebase/database').set;
const onValue = require('firebase/database').onValue;

const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name);
const { setupMQTT, fetchTemperatureDataAfter } = require('./mqtt_connect.js');
// const { onValue } = require('firebase/database');

// firebase init
const firebaseConfig = {
    apiKey: "AIzaSyBfc8OlhEQ-wIpNL3l2v-mTRPVl0droKRY",
    authDomain: "smartfarm-ddbc3.firebaseapp.com",
    databaseURL: "https://smartfarm-ddbc3-default-rtdb.firebaseio.com",
    projectId: "smartfarm-ddbc3",
    storageBucket: "smartfarm-ddbc3.appspot.com",
    messagingSenderId: "945689382597",
    appId: "1:945689382597:web:ca23f3de21c44e2645aaac"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const startTime = '2024-09-12 21:38:00';

module.exports = database;


function storeSensorData(message) {
    console.log("initSensor callback");

    setupMQTT(database, ref);
    message.respond({
        returnValue: true,
        Response: "Sensor data stored"
    });
}

async function getSensorData(message) {
    try {
        const sensorData = await fetchTemperatureDataAfter(database, startTime, ref, onValue);
        console.log("Returned sensor data: ", sensorData);
        message.respond({
            returnValue: true,
            Response: sensorData
        });
    } catch (error) {
        console.error("Error: ", error);
    }
}



service.register("storeSensorData", storeSensorData);
service.register("getSensorData", getSensorData);
