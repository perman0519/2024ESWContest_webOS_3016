const mqtt = require('mqtt');
require('dotenv').config({ path: './.env' });
const { set, onValue, ref, get, update } = require('firebase/database');
let lastSavedTime = 0;

function updateSectorInfo(database, sensorData)
{
    function getLocalTimestamp() {
        const now = new Date();
        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
    }

    const currentTime = Date.now();

    if (currentTime - lastSavedTime >= 30000) {
        lastSavedTime = currentTime;
        console.log("30초 경과: 데이터를 저장합니다.");

        if (!sensorData || !sensorData.data || isNaN(sensorData.data.humidity) || isNaN(sensorData.data.temperature) || isNaN(sensorData.data.soil_humidity)) {
            console.error("Missing required sensor data: ", sensorData);
        } else {
            console.log("Saving to Firebase: ", sensorData);

            const sector_id = sensorData.sector;
            const timeStamp = getLocalTimestamp();
            console.log(sector_id, timeStamp, `sector/${sector_id}/sensorData/`);
            const sectorValue = ref(database, `sector/${sector_id}/sensorData`);

            const sectorRef = ref(database, `sector/${sector_id}/`); //testing ok

            onValue(sectorValue, (snapshot) => {
                const existingData = snapshot.val() || {};
                if (!existingData[timeStamp]) {
                    existingData[timeStamp] = sensorData.data;
                } else {
                    console.log("Data with the same timestamp already exists, skipping...");
                }
                set(sectorValue, existingData)
                    .then(() => {
                        console.log("Data updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating data: ", error);
                    });
            });
            // 주간평균을 DB에 저장
            saveWeekData(sectorRef, database); //testing
        }
    } else {
        console.log("Skipped saving, waiting for 30 seconds interval.");
    }
}

function receivedMessage(message, database) {
    console.log(message);
    console.log("Message received: " + message.toString());

    let sensorData;

    try {
        sensorData = JSON.parse(message.toString());
        console.log("Parsed sensor data: ", sensorData);
        updateSectorInfo(database, sensorData);
    } catch (error) {
        console.error("Invalid message format: ", error);
        return;
    }
}

function connectionSuccess(client, mqtt_topic) {
    console.log("Connected to MQTT broker");

    // MQTT 토픽 구독
    client.subscribe(mqtt_topic, { qos: 1 }, function (err) {
        if (!err) {
            console.log(`Subscribed to topic: ${mqtt_topic}`);
        } else {
            console.log("Failed to subscribe: ", err.message);
        }
    });
}

function connectionError(err) {
    console.log("Connection failed: ", err.message);
}

function setupMQTT(database) {
    const mqtt_host = process.env.MQTT_HOST;
    const mqtt_port = process.env.MQTT_PORT;
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100);

    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    const mqtt_topic = "sensor/all";
    client.on('connect', () => {connectionSuccess(client, mqtt_topic)});
    client.on('error', connectionError);
    client.on('message', (topic, msg) => {receivedMessage(msg, database)});
}

// function saveWeeklyAvgToFirebase(sector_id, weeklyData, database) {
//     const dataRef = ref(database, `sector/${sector_id}/weekly_avg`);

//     // weeklyData가 배열일 경우, 주차별로 '0', '1', '2' 등의 키로 객체로 변환
//     if (Array.isArray(weeklyData)) {
//         const dataToUpdate = weeklyData.reduce((obj, item, index) => {
//             obj[index] = item;  // 주차별 데이터를 '0', '1' 형식으로 저장
//             return obj;
//         }, {});

//         // Firebase 업데이트
//         update(dataRef, dataToUpdate)
//           .then(() => {
//             console.log('Firebase weekly_avg 저장 성공');
//           })
//           .catch((error) => {
//             console.log('Firebase weekly_avg 저장 실패: ', error);
//           });
//     } else {
//         console.error('weeklyData는 배열이어야 합니다:', weeklyData);
//     }
// }

function saveWeeklyAvgToFirebase(sector_id, weeklyData, database) {
    const dataRef = ref(database, `sector/${sector_id}/weekly_avg`);

    // 기존 데이터를 먼저 가져옴
    get(dataRef)
      .then((snapshot) => {
        const existingData = snapshot.val() || {};

        // weeklyData의 키가 숫자(0, 1, 2 등)로 설정되어 있으므로, 기존 필드를 유지하면서 주차별 데이터만 덮어씌움
        const mergedData = { ...existingData };
        console.log("merge", mergedData);

        // 새로 추가할 데이터를 주차별로 병합
        Object.keys(weeklyData).forEach(weekKey => {
            mergedData[weekKey] = {
                ...existingData[weekKey],  // 기존 주차 데이터 유지
                ...weeklyData[weekKey]     // 새로운 주차 데이터 추가
            };
        });

        // 업데이트 메서드를 사용하여 데이터 병합
        return update(dataRef, mergedData);
      })
      .then(() => {
        console.log('Firebase weekly_avg 저장 성공');
      })
      .catch((error) => {
        console.log('Firebase weekly_avg 저장 실패: ', error);
      });
}



// function saveWeeklyAvgToFirebase(sector_id, weeklyData, database) {
//     const dataRef = ref(database, `sector/${sector_id}/weekly_avg`);
    
//     // 기존 데이터를 먼저 가져옴
//     get(dataRef)
//       .then((snapshot) => {
//         const existingData = snapshot.val() || {};

//         // 새로 추가할 데이터를 기존 데이터에 합침
//         const mergedData = {
//           ...existingData,  // 기존 데이터 유지
//           ...weeklyData     // 새로운 데이터 추가 (기존 키와 충돌하면 덮어씌워짐)
//         };

//         // 업데이트 메서드를 사용하여 데이터 저장
//         return set(dataRef, mergedData);
//       })
//       .then(() => {
//         console.log('Firebase weekly_avg 저장 성공');
//       })
//       .catch((error) => {
//         console.log('Firebase weekly_avg 저장 실패: ', error);
//       });
// }

function groupByWeek(data) {
    const groupedData = [];
    let currentWeekStart = new Date(data[0].date);
    let currentWeekData = [];

    data.forEach((entry) => {
        const diff = (entry.date - currentWeekStart) / (1000 * 60 * 60 * 24); // 날짜 차이 계산 (일 단위)

        if (diff >= 7) {
            groupedData.push({
                weekStart: currentWeekStart,
                avgTemperature: currentWeekData.reduce((sum, d) => sum + d.temperature, 0) / currentWeekData.length,
                avgSoilHumidity: currentWeekData.reduce((sum, d) => sum + d.soil_humidity, 0) / currentWeekData.length
            });

            currentWeekStart = new Date(entry.date);
            currentWeekData = [];
        }

        currentWeekData.push(entry);
    });

    if (currentWeekData.length > 0) {
        groupedData.push({
            weekStart: currentWeekStart,
            avgTemperature: currentWeekData.reduce((sum, d) => sum + d.temperature, 0) / currentWeekData.length,
            avgSoilHumidity: currentWeekData.reduce((sum, d) => sum + d.soil_humidity, 0) / currentWeekData.length
        });
    }

    return groupedData; 
}

function saveWeekData(sectorRef, database)
{
    get(sectorRef)
    .then((snapshot) => {
        let currentData = snapshot.val();
        
        console.log(currentData);
        const sensorData = currentData.sensorData;
        const entries = Object.entries(sensorData).map(([dateString, values]) => ({
            date: new Date(dateString),
            ...values
          }));
        const weeklyData = groupByWeek(entries);
        saveWeeklyAvgToFirebase(0, weeklyData, database);
    })
    .then(() => {
        console.log("Firebase 읽어오기 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}

module.exports = { setupMQTT };
