const WebSocket = require("ws");
const pkgInfo = require('./package.json');
const serviceInfo = require('./services.json')
const Service = require('webos-service');
const service = new Service(pkgInfo.name);
// const { ref, set } = require('firebase/database');
const mqtt = require('mqtt');
// const database = require('./service_sensor/sensor_store.js');

const logHeader = "[" + pkgInfo.name + "]";

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyBfc8OlhEQ-wIpNL3l2v-mTRPVl0droKRY",
    authDomain: "smartfarm-ddbc3.firebaseapp.com",
    databaseURL: "https://smartfarm-ddbc3-default-rtdb.firebaseio.com",
    projectId: "smartfarm-ddbc3",
    storageBucket: "smartfarm-ddbc3.appspot.com",
    messagingSenderId: "945689382597",
    appId: "1:945689382597:web:ca23f3de21c44e2645aaac"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Firebase에 명령 저장하는 함수
function storeLedStatus(sector_id, state) {
    const commandRef = ref(database, `sector/${sector_id}/LED_Status/`);
    set(commandRef, {
        status: state,
    })
    .then(() => {
        console.log("Firebase 저장 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}

function storePumpStatus(sector_id, state) {
    const commandRef = ref(database, `sector/${sector_id}/Pump_Status/`);
    set(commandRef, {
        status: state,
    })
    .then(() => {
        console.log("Firebase 저장 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}


function publishToMQTT(topic, command) {
    const mqtt_host = "54.180.187.212";
    const mqtt_port = "8000";
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100);

    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    client.on('connect', function () {
        console.log("mqtt Connected to MQTT broker");
    });

    client.on('error', function (err) {
        console.log("mqtt Connection failed: ", err.message);
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

// {
//     "user_id": ${user.uid},
//     "sector_id": ${0},
//     "type": ${type},
//     "command": ${toggleStatus ? "ON" : "OFF"}
// }

// const database = getDatabase();


function socketServer(message) {
    console.log("In sensorControlServer callback");
    try {
        if (!serverStarted) {
            const wss = new WebSocket.Server({ port: 3001 });
            wss.on("connection", (socket) => {
                socket.on("close", () => {
                    console.log("Connection closed");
                    // setTimeout(socketServer, 100); // 5초 후 재연결
                });
                socket.on("message", (message) => {
                    console.log('Received message:', message.toString('utf8'));

                    jsonMsg = JSON.parse(message.toString('utf8'));
                    const sector_id = jsonMsg.sector_id || 0;
                    if (jsonMsg.type === "led") {
                        if (jsonMsg.command === "ON") {
                            console.log("LED ON");
                            publishToMQTT("esp32/led/command", "ON");
                            storeLedStatus(0, "ON");
                            socket.send("{ \"status\": \"success\", \"message\": \"LED ON\" }");
                            // const ledStatus = ref(database, `sector/${sector_id}/LED_Status/`);
                            // set(ledStatus, "ON")
                            //     .then(() => {
                            //         console.log("LED status updated in Firebase: ON");
                            //     })
                            //     .catch((error) => {
                            //         console.error("Error updating Firebase: ", error);
                            //     });
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("LED OFF");
                            publishToMQTT("esp32/led/command", "OFF");
                            storeLedStatus(0, "OFF");
                            socket.send("{ \"status\": \"success\", \"message\": \"LED OFF\" }");

                            // const ledStatus = ref(database, `sector/${sector_id}/LED_Status/`);
                            // set(ledStatus, "OFF")
                            //     .then(() => {
                            //         console.log("LED status updated in Firebase: OFF");
                            //     })
                            //     .catch((error) => {
                            //         console.error("Error updating Firebase: ", error);
                            //     });
                        }
                    }
                    else if (jsonMsg.type === "waterpump") {
                        if (jsonMsg.command === "ON") {
                            console.log("pump ON");
                            publishToMQTT("esp32/waterpump/command", "ON");
                            storePumpStatus(0, "ON");
                            socket.send("{ \"status\": \"success\", \"message\": \"WaterPump ON\" }");
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("pump OFF");
                            publishToMQTT("esp32/waterpump/command", "OFF");
                            storePumpStatus(0, "OFF");
                            socket.send("{ \"status\": \"success\", \"message\": \"WaterPump OFF\" }");
                        }
                    }
                    else if (jsonMsg.type === "timelapse") {
                        console.log("timelapse");
                        //timelapse영상제작
                    }
                    // socket.send("WebSocket server is running");
                });
            });
            serverStarted = true;
        } else {
            console.log("WebSocket is already started.");
        }
    } catch (e) {
        console.log("Error in sensorControlServer:", e);
    }

    //------------------------- heartbeat 구독 -------------------------
    const sub = service.subscribe(`luna://${pkgInfo.name}/heartbeat`, {subscribe: true});
    const max = 5000; //heart beat 횟수 /// heart beat가 꺼지면, 5초 정도 딜레이 생김 --> 따라서 이 녀석도 heart beat를 무한히 돌릴 필요가 있어보임.
    let count = 0;
    sub.addListener("response", function(msg) {
        console.log(JSON.stringify(msg.payload));
        if (++count >= max) {
            sub.cancel();
            setTimeout(function(){
                console.log(max+" responses received, exiting...");
                process.exit(0);
            }, 1000);
        }
    });

    message.respond({
        returnValue: true,
        Response: "ok port 3001"
    });
}

service.register("socketServer", socketServer);
service.register("test", (message) => {
    service.call("luna://com.farm.server.sensor.service/getSensorData", {}, (response) => {
        console.log("Call to getSensorData");
        console.log("Message payload:", JSON.stringify(response.payload));
    });
    message.respond({
        returnValue: true,
        Response: "test success"
    });
});

// //----------------------------------------------------------------------heartbeat----------------------------------------------------------------------
// // handle subscription requests
const subscriptions = {};
let heartbeatinterval;
let x = 1;
function createHeartBeatInterval() {
    if (heartbeatinterval) {
        return;
    }
    console.log(logHeader, "create_heartbeatinterval");
    heartbeatinterval = setInterval(function() {
        sendResponses();
    }, 1000);
}

// send responses to each subscribed client
function sendResponses() {
    console.log(logHeader, "send_response");
    console.log("Sending responses, subscription count=" + Object.keys(subscriptions).length);
    for (const i in subscriptions) {
        if (Object.prototype.hasOwnProperty.call(subscriptions, i)) {
            const s = subscriptions[i];
            s.respond({
                returnValue: true,
                event: "beat " + x
            });
        }
    }
    x++;
}

var heartbeat = service.register("heartbeat");
heartbeat.on("request", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat");
    message.respond({event: "beat"}); // initial response
    if (message.isSubscription) {
        subscriptions[message.uniqueToken] = message; //add message to "subscriptions"
        if (!heartbeatinterval) {
            createHeartBeatInterval();
        }
    }
});
heartbeat.on("cancel", function(message) {
    delete subscriptions[message.uniqueToken]; // remove message from "subscriptions"
    var keys = Object.keys(subscriptions);
    if (keys.length === 0) { // count the remaining subscriptions
        console.log("no more subscriptions, canceling interval");
        clearInterval(heartbeatinterval);
        heartbeatinterval = undefined;
    }
});
