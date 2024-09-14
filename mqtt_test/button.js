// DOMContentLoaded 이벤트를 사용하여 HTML 로드 완료 후 코드 실행
let led_toggleStatus = 0;
let water_toggleStatus = 0;
document.addEventListener("DOMContentLoaded", function () {
	var mqtt_host = "192.168.100.102";
	var mqtt_port = "8000";
	var mqtt_clientId = "clientID-" + parseInt(Math.random() * 100);

	let led_button = document.querySelector("#LED_BUTTON");
	led_button.innerText = "LED BUTTON";
	let water_button =  document.querySelector("#WATER_BUTTON");
	water_button.innerText = "WATERPUMP BUTTON";

	// MQTT 클라이언트 설정
	let client = new Paho.MQTT.Client("ws://" + mqtt_host + ":" + mqtt_port + "/mqtt", mqtt_clientId);

	// 브로커 연결 옵션
	var options = {
		timeout: 3,
		onSuccess: function () {
			console.log("Connected to MQTT broker");
			document.querySelector("#txt_msg").innerText = "connection Success";
		},
		onFailure: function (message) {
			console.log("Connection failed: " + message.errorMessage);
			document.querySelector("#txt_msg").innerText = "connection fail";
		}
	};

	// 브로커 연결
	client.connect(options);

	// 메시지 송신 함수
	function sendMessage(toggleStatus, destinationName, button) {
	   let message;
	   if (!toggleStatus) {
		   message = new Paho.MQTT.Message("ON");
		   button.innerText = destinationName.includes("led") ? "LED ON" : "WATERPUMP ON";
	   } else {
		   message = new Paho.MQTT.Message("OFF");
		   button.innerText = destinationName.includes("led") ? "LED OFF" : "WATERPUMP OFF";
	   }
	   message.destinationName = destinationName; // 전송할 토픽 이름
	   client.send(message);
	   document.getElementById("mqtt_msg").innerText = "Message sent: " + message.payloadString;
	   return !toggleStatus; // 토글 상태를 반전시켜 반환
   }

	led_button.addEventListener("click", function() {
	   led_toggleStatus = sendMessage(led_toggleStatus, "esp32/led/command", led_button);
   });

   water_button.addEventListener("click", function() {
	   water_toggleStatus = sendMessage(water_toggleStatus, "esp32/waterpump/command", water_button);
   });
});
