// DOMContentLoaded 이벤트를 사용하여 HTML 로드 완료 후 코드 실행
document.addEventListener("DOMContentLoaded", function () {
    var mqtt_host = "10.19.220.146"; // 브로커 ip
    var mqtt_port = "8000"; // 브로커 포트
    var mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트ID
    var mqtt_topic = "Sensor/Temp_Humi"; // 구독할 토픽

    // MQTT 클라이언트 설정
    let client = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), "/mqtt", mqtt_clientId);

    // 메시지 수신 콜백 함수
    client.onMessageArrived = function (message) {
        console.log("Message received: " + message.payloadString);
        document.querySelector("#mqtt_msg").innerText = "Received message: " + message.payloadString;
    };

    // 브로커 연결 옵션
    var options = {
        timeout: 3,
        onSuccess: function () {
            console.log("Connected to MQTT broker");
            document.querySelector("#txt_msg").innerText = "Connection Success";

            // 브로커 연결 성공 시 토픽 구독
            client.subscribe(mqtt_topic, {
                qos: 1, // QoS 설정 (0, 1, 2 중 선택 가능)
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
        onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage);
            document.querySelector("#txt_msg").innerText = "Connection fail";
        }
    };

    // 브로커 연결
    client.connect(options);
});