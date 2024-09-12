function setupMQTT(database) 
{
    var mqtt_host = "192.168.100.100"; // 브로커 IP
    var mqtt_port = "8000"; // 브로커 포트
    var mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID
    var mqtt_topic = "Sensor/Temp_Humi"; // 구독할 토픽

    // 마지막 저장된 시간을 기록하는 변수
    let lastSavedTime = 0;

    // 지역 시간 타임스탬프 생성 함수
    function getLocalTimestamp() 
    {
        const now = new Date();
        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
    }

    // MQTT 클라이언트 생성
    let client = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), "/mqtt", mqtt_clientId);

    // 메시지 수신 콜백 함수
    client.onMessageArrived = function (message) 
    {
        console.log("Message received: " + message.payloadString);
        document.querySelector("#mqtt_msg").innerText = "Received message: " + message.payloadString;

        let sensorData;
        try 
        {
            sensorData = JSON.parse(message.payloadString);
            console.log("Parsed sensor data: ", sensorData);
        } 
        catch (error) 
        {
            console.error("Invalid message format: ", error);
            return;
        }

        // 현재 시간 (밀리초 단위로 저장)
        const currentTime = Date.now();

        console.log("Current time:", currentTime);
        console.log("Last saved time:", lastSavedTime);
        console.log("Time difference:", currentTime - lastSavedTime);

        // 30초 간격으로 저장.
        if (currentTime - lastSavedTime >= 30000) 
        {
            lastSavedTime = currentTime;
            console.log("30초 경과: 데이터를 저장합니다.");
            if (sensorData.Temperature && sensorData.Humidity) 
            {
                console.log("Saving to Firebase: ", sensorData);

                // Firebase에 데이터 저장
                database.ref('sensorValue').push({
                    temperature: sensorData.Temperature,
                    humidity: sensorData.Humidity,
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
    };

    // 브로커 연결 옵션
    var options = {
        timeout: 3,
        onSuccess: function () 
        {
            console.log("Connected to MQTT broker");
            document.querySelector("#txt_msg").innerText = "Connection Success";

            // MQTT 토픽 구독
            client.subscribe(mqtt_topic, {
                qos: 1,
                onSuccess: function () {
                    console.log("Subscribed to topic: " + mqtt_topic);
                    document.querySelector("#txt_msg").innerText += " | Subscribed to topic";
                },
                onFailure: function (error) {
                    console.log("Failed to subscribe: " + error.errorMessage);
                    document.querySelector("#txt_msg").innerText += " | Subscription failed";
                }
            });
        },
        onFailure: function (message) 
        {
            console.log("Connection failed: " + message.errorMessage);
            document.querySelector("#txt_msg").innerText = "Connection fail";
        }
    };

    // 브로커 연결
    client.connect(options);
}

function fetchTemperatureDataAfter(database, startTime) 
{
    // 'sensorValue' 경로에서 타임스탬프가 특정 시각 이후인 데이터를 가져옴
    database.ref('sensorValue')
        .orderByChild('timestamp') // 타임스탬프 필드를 기준으로 정렬
        .startAt(startTime) // 주어진 startTime 이후의 데이터만 필터링
        .on('value', (snapshot) => { // 실시간으로 데이터 변경을 감지
            if (snapshot.exists()) 
            {
                const data = snapshot.val();
                const temperatures = [];    // 데이터베이스에 접근해서 데이터를 담아둘 배열

                // 온도 데이터만 추출하여 배열에 저장
                for (let key in data) 
                {
                    if (data[key].temperature) 
                    {
                        temperatures.push(data[key].temperature);
                    }
                }

                console.log(`Fetched temperatures after ${startTime}: `, temperatures);

                // temperatures 배열의 값을 문자열로 변환하여 화면에 출력
                document.querySelector("#sensor_data").innerText = temperatures.join('\n');
            } 
            else 
            {
                console.log("No data available after the specified time");
            }
        }, (error) => {
            console.error("Error fetching data: ", error);
        });
}



