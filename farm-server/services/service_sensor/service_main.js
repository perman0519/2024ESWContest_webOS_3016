const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name);
const { setupMQTT } = require('./mqtt_connect.js');
const { database } = require('./firebase.js');

function storeSensorData(message) {
    setupMQTT(database);
    message.respond({
        returnValue: true,
        Response: "Sensor data stored"
    });
}

// async function getSensorData(message) {
//     try {
//         const sensorData = await getSensorData(database, ref, onValue);
//         console.log("Returned sensor data: ", sensorData);
//         message.respond({
//             returnValue: true,
//             Response: sensorData
//         });
//     } catch (error) {
//         console.error("Error: ", error);
//     }
// }

service.register("storeSensorData", storeSensorData);
// service.register("getSensorData", getSensorData);
