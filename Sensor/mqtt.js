const mqtt = require('mqtt');

function setupMQTT(database) {
    const mqtt_host = "192.168.100.101"; // 브로커 IP
    const mqtt_port = "8000"; // 브로커 포트
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID
    const mqtt_topic = "sensor/all"; // 구독할 토픽

    // 마지막 저장된 시간을 기록하는 변수
    let lastSavedTime = 0;

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
        } catch (error) {
            console.error("Invalid message format: ", error);
            return;
        }

        // 현재 시간 (밀리초 단위로 저장)
        const currentTime = Date.now();

        // 30초 간격으로 저장
        if (currentTime - lastSavedTime >= 30000) {
            lastSavedTime = currentTime;
            console.log("30초 경과: 데이터를 저장합니다.");

            if (sensorData.humidity && sensorData.temperature && sensorData.soil_humidity) {
                console.log("Saving to Firebase: ", sensorData);

                // Firebase에 데이터 저장
                database.ref('sensorValue').push({
                    temperature: sensorData.temperature,
                    humidity: sensorData.humidity,
                    soil_humidity: sensorData.soil_humidity,
                    timestamp: getLocalTimestamp()
                }).then(() => {
                    console.log("Message saved to Realtime Database");
                }).catch((error) => {
                    console.error("Error saving message: ", error);
                });
            } else {
                console.error("Missing required sensor data: ", sensorData);
            }
        } else {
            console.log("Skipped saving, waiting for 30 seconds interval.");
        }
    });
}

module.exports = { setupMQTT, fetchTemperatureDataAfter };
