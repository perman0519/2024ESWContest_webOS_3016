// MQTT 클라이언트 객체 생성
var client = new Paho.MQTT.Client("192.168.106.135", Number(1883), "/mqtt", "webOSClient-" + Math.random());
let mqttMsg = document.querySelector("#mqtt_msg");
let txtMsg = document.querySelector("#txt_msg");
let onOff = document.querySelector("#onOff");

txtMsg.innerText = "APP open";

// 연결 성공 시 호출되는 콜백 함수
client.onConnectionLost = function(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
};

// 메시지 수신 시 호출되는 콜백 함수
client.onMessageArrived = function(message) {
    console.log("Message received on topic: " + message.destinationName);
    console.log("Message content: " + message.payloadString);
    // 메시지를 웹OS 앱의 UI에 표시하거나 추가 작업 수행
    msg.innerText = message.payloadString;
};

// MQTT 브로커에 연결하기
client.connect({
    onSuccess: function() {
        console.log("Connected to MQTT broker");
        // 'mqttTopic' 토픽 구독
        client.subscribe("mqttTopic");
        console.log("Subscribed to mqttTopic");
        txtMsg.innerText = "Subscribed to mqttTopic";
    },
    onFailure: function(error) {
        console.error("Connection failed: " + error.errorMessage);
    }
});
