const mqtt = require('mqtt');
const { push, set, onValue } = require('firebase/database');

// 마지막 저장된 시간을 기록하는 변수
let lastSavedTime = 0;

//sensor한테 받은 데이터를 db에 각 해당 sector 하위에 추가.
function updateSectorInfo(database, sensorData, ref)
{
    // 지역 시간 타임스탬프 생성 함수
    function getLocalTimestamp() {
        const now = new Date();
        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
    }

    // 현재 시간 (밀리초 단위로 저장)
    const currentTime = Date.now();

    if (currentTime - lastSavedTime >= 30000) {
        lastSavedTime = currentTime;
        console.log("30초 경과: 데이터를 저장합니다.");

        if (isNaN(sensorData.data.humidity) || isNaN(sensorData.data.temperature) || isNaN(sensorData.data.soil_humidity)) {
            console.error("Missing required sensor data: ", sensorData);
        } else {
            console.log("Saving to Firebase: ", sensorData);

            const sector_id = sensorData.sector;
            const timeStamp = getLocalTimestamp();
            const sectorValue = ref(database, `sector/${sector_id}/sensorData/`);

            onValue(sectorValue, (snapshot) => {
                const existingData = snapshot.val() || {}; // 데이터가 없을 때도 existingData 변수가 객체 형식으로 초기화

                // 새로운 데이터 추가 시, 같은 타임스탬프가 없을 경우에만 추가
                if (!existingData[timeStamp]) {
                    existingData[timeStamp] = sensorData.data; // 새 데이터 추가
                } else {
                    console.log("Data with the same timestamp already exists, skipping...");
                }

                // 업데이트된 데이터를 다시 저장
                set(sectorValue, existingData)
                    .then(() => {
                        console.log("Data updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating data: ", error);
                    });
            });

            // const newSectorValue = push(sectorValue);
            // set (newSectorValue, sensorData.data)

            // const sectorValue = database.ref(`sector/${sector_id}/sensorData/${timeStamp}`);
            // sectorValue.push(sensorData.data); // 우리가 넣어줄 JSON 값으로 변경.
        }
    } else {
        console.log("Skipped saving, waiting for 30 seconds interval.");
    }
}

function setupMQTT(database, ref) {
    const mqtt_host = "54.180.187.212"; // 브로커 IP
    const mqtt_port = "8000"; // 브로커 포트
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID
    const mqtt_topic = "sensor/all"; // 나중에 변경

    // MQTT 클라이언트 생성
    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    // 브로커 연결 성공 이벤트
    client.on('connect', function () {
        console.log("Connected to MQTT broker");

        // MQTT 토픽 구독
        client.subscribe(mqtt_topic, { qos: 1 }, function (err) {
            if (!err) {
                console.log(`Subscribed to topic: ${mqtt_topic}`);
            } else {
                console.log("Failed to subscribe: ", err.message);
            }
        });
    });

    // 브로커 연결 실패 이벤트
    client.on('error', function (err) {
        console.log("Connection failed: ", err.message);
    });

    // 메시지 수신 이벤트
    client.on('message', function (topic, message) {
        console.log("Message received: " + message.toString());

        let sensorData;
        try {
            sensorData = JSON.parse(message.toString());
            console.log("Parsed sensor data: ", sensorData);
            updateSectorInfo(database, sensorData, ref);
        } catch (error) {
            console.error("Invalid message format: ", error);
            return;
        }
    });
}

function fetchTemperatureDataAfter(database, startTime, ref, onValue)
{
    return new Promise((resolve, reject) => {
        const starCountRef = ref(database, 'sector/0/sensorData');
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            // updateStarCount(postElement, data);
            resolve(data);
        });

        // database.ref('sensorValue')
        //     .orderByChild('timestamp') // 타임스탬프 필드를 기준으로 정렬
        //     .startAt(startTime) // 주어진 startTime 이후의 데이터만 필터링
        //     .on('value', (snapshot) => { // 실시간으로 데이터 변경을 감지
        //         if (snapshot.exists())
        //         {
        //             const data = snapshot.val();
        //             const sensor = [];    // 데이터베이스에 접근해서 데이터를 담아둘 배열

        //             // 온도 데이터만 추출하여 배열에 저장
        //             for (let key in data)
        //             {
        //                 if (data[key].temperature)
        //                 {
        //                     sensor.push(data[key].temperature);
        //                 }
        //             }

        //             console.log(`Fetched sensor after ${startTime}: `, sensor);

        //             // 데이터를 성공적으로 가져왔으므로 resolve 호출
        //             resolve(sensor);
        //         }
        //         else
        //         {
        //             console.log("No data available after the specified time");
        //             resolve([]); // 데이터가 없으면 빈 배열을 반환
        //         }
        //     }, (error) => {
        //         console.error("Error fetching data: ", error);
        //         reject(error); // 에러 발생 시 Promise를 reject로 처리
        //     });
    });
}

module.exports = { setupMQTT, fetchTemperatureDataAfter };


// function setupMQTT(database, ref, set) {
//     const mqtt_host = "10.19.218.225"; // 브로커 IP
//     const mqtt_port = "8000"; // 브로커 포트
//     const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID
//     const mqtt_topic = "sensor/all"; // 구독할 토픽

//     // 마지막 저장된 시간을 기록하는 변수
//     let lastSavedTime = 0;

//     // 지역 시간 타임스탬프 생성 함수
//     function getLocalTimestamp() {
//         const now = new Date();
//         return now.getFullYear() + '-' +
//             String(now.getMonth() + 1).padStart(2, '0') + '-' +
//             String(now.getDate()).padStart(2, '0') + ' ' +
//             String(now.getHours()).padStart(2, '0') + ':' +
//             String(now.getMinutes()).padStart(2, '0') + ':' +
//             String(now.getSeconds()).padStart(2, '0');
//     }

//     // MQTT 클라이언트 생성
//     const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
//         clientId: mqtt_clientId,
//     });

//     // 브로커 연결 성공 이벤트
//     client.on('connect', function () {
//         console.log("Connected to MQTT broker");

//         // MQTT 토픽 구독
//         client.subscribe(mqtt_topic, { qos: 1 }, function (err) {
//             if (!err) {
//                 console.log(`Subscribed to topic: ${mqtt_topic}`);
//             } else {
//                 console.log("Failed to subscribe: ", err.message);
//             }
//         });
//     });

//     // 브로커 연결 실패 이벤트
//     client.on('error', function (err) {
//         console.log("Connection failed: ", err.message);
//     });

//     // 메시지 수신 이벤트
//     client.on('message', function (topic, message) {
//         console.log("Message received: " + message.toString());

//         let sensorData;
//         try {
//             sensorData = JSON.parse(message.toString());
//             console.log("Parsed sensor data: ", sensorData);
//         } catch (error) {
//             console.error("Invalid message format: ", error);
//             return;
//         }

//         // 현재 시간 (밀리초 단위로 저장)
//         const currentTime = Date.now();

//         // 30초 간격으로 저장
//         if (currentTime - lastSavedTime >= 30000) {
//             lastSavedTime = currentTime;
//             console.log("30초 경과: 데이터를 저장합니다.");

//             if (sensorData.humidity && sensorData.temperature && sensorData.soil_humidity) {
//                 console.log("Saving to Firebase: ", sensorData);

//                 // Firebase에 데이터 저장
//                 set(ref(database, 'sensorValue/basil'), {
//                     temperature: sensorData.temperature,
//                     humidity: sensorData.humidity,
//                     soil_humidity: sensorData.soil_humidity,
//                     timestamp: getLocalTimestamp()
//                 });
//                 // database.ref('sensorValue').push({
//                 //     temperature: sensorData.temperature,
//                 //     humidity: sensorData.humidity,
//                 //     soil_humidity: sensorData.soil_humidity,
//                 //     timestamp: getLocalTimestamp()
//                 // }).then(() => {
//                 //     console.log("Message saved to Realtime Database");
//                 // }).catch((error) => {
//                 //     console.error("Error saving message: ", error);
//                 // });
//             } else {
//                 console.error("Missing required sensor data: ", sensorData);
//             }
//         } else {
//             console.log("Skipped saving, waiting for 30 seconds interval.");
//         }
//     });
// }
