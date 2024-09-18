const WebSocket = require("ws");
const pkgInfo = require('./package.json');
const serviceInfo = require('./services.json')
const Service = require('webos-service');
const service = new Service(pkgInfo.name);

const mqtt = require('mqtt');

function publishToMQTT(topic, command) {
    const mqtt_host = "10.19.218.225"; // 브로커 IP
    const mqtt_port = "8000"; // 브로커 포트
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID

    // MQTT 클라이언트 생성
    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    // 브로커 연결 성공 이벤트
    client.on('connect', function () {
        console.log("mqtt Connected to MQTT broker");
    });

    // 브로커 연결 실패 이벤트
    client.on('error', function (err) {
        console.log("mqtt Connection failed: ", err.message);
        //재연결 시도하도록 하는 부분이 필요
    });

    client.publish(topic, command, {qos : 1}, function (err){
        if (!err){
            console.log(`topic publish success : ${topic}`);
        }
        else {
            console.log("publish failed: ", err.message);
        }
    });
}

let serverStarted = false;

function sensorControlServer(message) {
    console.log("In sensorControlServer callback");

    try {
        if (!serverStarted) {
            const wss = new WebSocket.Server({ port: 3001 }); //생성하면서 동시에 연결시도

            wss.on("connection", (socket) => {
                socket.on("close", () => {
                    console.log("Connection closed");
                });
                // {
                //     "user_id": ${user.uid},
                //     "sector_id": ${0},
                //     "type": ${type},
                //     "command": ${toggleStatus ? "ON" : "OFF"}
                // }
                socket.on("message", (message) => {
                    console.log('Received message:', message.toString('utf8'));

                    jsonMsg = JSON.parse(message.toString('utf8'));
                    if (jsonMsg.type === "led") {
                        if (jsonMsg.command === "ON") {
                            console.log("LED ON");
                            publishToMQTT("esp32/led/command", "ON");
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("LED OFF");
                            publishToMQTT("esp32/led/command", "OFF");
                        }
                    }
                    else if (jsonMsg.type === "waterpump") {
                        if (jsonMsg.command === "ON") {
                            console.log("pump ON");
                            publishToMQTT("esp32/waterpump/command", "ON");
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("pump ON");
                            publishToMQTT("esp32/waterpump/command", "OFF");
                        }
                    }
                    //아직 동작안됨
                    // service.call("luna://com.farm.server.sensor.service/getSensorData", {}, (response) => {
                    //     console.log("Call to getSensorData");
                    //     console.log("Message payload:", JSON.stringify(response.payload));
                    //     // 클라이언트에 응답 전송
                    //     socket.send(JSON.stringify(response.payload));
                    //     console.log('Sent response message:', JSON.stringify(response.payload));
                    // });
                    // }
                    socket.send("WebSocket server is running");
                });
            });

            // 서버가 시작된 상태로 플래그 변경
            serverStarted = true;
        } else {
            console.log("WebSocket 서버는 이미 시작되었습니다.");
        }
    } catch (e) {
        console.log("Error in sensorControlServer:", e);
    }

    // Heartbeat 서비스 구독
    // const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', { subscribe: true });

    // 응답 메시지 보내기
    message.respond({
        returnValue: true,
        Response: "ok port 3001"
    });
}

service.register("sensorControlServer", sensorControlServer);



// const Service = require('webos-service');
// const { startServer } = require('./ws_server.js');

// const service = new Service("com.our42.farm.control.dashboard.sensor.control.service");

// service.register("sensorControlServer", function(message) {
//     try {
//         console.log("In sensorControlServer callback");

//         // WebSocket 서버 시작
//         startServer();

//         // 구독
//         const sub = await new Promise((resolve, reject) => {
//             service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true}, (response) => {
//                 if (response.returnValue) {
//                     resolve(response);
//                 } else {
//                     reject(new Error("Subscription failed"));
//                 }
//             });
//         });

//         message.respond({
//             returnValue: true,
//             Response: "ok port 3001"
//         });
//     } catch (error) {
//         console.error("Error in sensorControlServer:", error);
//         message.respond({
//             returnValue: false,
//             errorText: error.message
//         });
//     }
// });


