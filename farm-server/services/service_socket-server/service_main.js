const WebSocket = require("ws");
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name);
const mqtt = require('mqtt');
// const { database } = require('./firebase.js');
const database = require('./firebase.js');
console.log("database: ",database);
const { ref, set, get } = require('firebase/database');
const logHeader = "[" + pkgInfo.name + "]";

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

// save weekly pump count to firebase
function saveWeeklyPumpData(sector_id, count) {
    let id = 0;  // id is week number
    const checkAndStore = () => {
        const dataRef = ref(database, `sector/${sector_id}/weekly_avg/${id}`);
        
        // read route from Firebase
        get(dataRef).then((snapshot) => {
            let currentData = snapshot.val();
            
            // if threr is no pumpCnt then push data
            if (!currentData || !currentData.pumpCnt) {
                let setData = {
                    ...currentData,  // set previous data
                    pumpCnt: count
                };

                // save data to Firebase
                return set(dataRef, setData)
                    .then(() => {
                        console.log(`ID ${id}에 pumpCnt 저장 성공`);
                    })
                    .catch((error) => {
                        console.error(`ID ${id}에 데이터 저장 실패: `, error);
                    });
            } else {
                // if there is pumpCnt on this ID then id++
                id++;
                checkAndStore();
            }
        }).catch((error) => {
            console.error(`Firebase 읽기 실패: `, error);
        });
    };
    // first call
    checkAndStore();
}

// storePumpStatus and add Pump_count
function storePumpStatus(sector_id, state) {
    const pumpRef = ref(database, `sector/${sector_id}/Pump_Status/`); //여기서 터짐
    const currentTime = new Date();

    // get data from Firebase
    get(pumpRef)
    .then((snapshot) => {
        let currentData = snapshot.val();
        
        // startTime이 연월일시분초 형식으로 저장되어 있는 경우 처리
        let startTime = currentData && currentData.start ? new Date(currentData.start) : currentTime;

        // 1주일(7일) 차이가 나는지 계산 (Date 객체끼리 비교)
        const timeDifference = (currentTime - startTime) / (1000 * 60 * 60 * 24); // 일 단위 계산

        let setData = {
            status: state,
            count: currentData && currentData.count ? currentData.count : 0,
            start: formatDate(startTime) // 저장할 때는 연월일시분초 형식으로 변환
        };

        // 1주일 이상 차이가 나면 count를 0으로 초기화하고 start를 현재 시간으로 설정
        if (timeDifference >= 7) {
            saveWeeklyPumpData(sector_id, currentData.count);
            setData.count = 0;
            setData.start = formatDate(currentTime); // 새로운 시작 시간을 현재 시간으로 설정
        }

        if (state === "ON") {
            setData.count += 1;
        }
        // 상태데이터 설정
        return set(pumpRef, setData);
    })
    .then(() => {
        console.log("Firebase 저장 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}

//publish command to MQTT brocker
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

// serverStart Status
let serverStarted = false;

// register service
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
                    const sector_id = jsonMsg.sector_id || 0; //When sector_ID not exist set sector_ID to 0.
                    if (jsonMsg.type === "led") {
                        if (jsonMsg.command === "ON") {
                            console.log("LED ON");
                            publishToMQTT("esp32/led/command", "ON");
                            storeLedStatus(0, "ON");
                            socket.send("{ \"status\": \"LED ON success\", \"message\": \"LED ON\" }");
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("LED OFF");
                            publishToMQTT("esp32/led/command", "OFF");
                            storeLedStatus(0, "OFF");
                            socket.send("{ \"status\": \"LED OFF success\", \"message\": \"LED OFF\" }");
                        }
                    }
                    else if (jsonMsg.type === "waterpump") {
                        if (jsonMsg.command === "ON") {
                            console.log("pump ON");
                            publishToMQTT("esp32/waterpump/command", "ON");
                            storePumpStatus(0, "ON");
                            socket.send("{ \"status\": \"WaterPump ON success\", \"message\": \"WaterPump ON\" }");
                        }
                        else if (jsonMsg.command === "OFF") {
                            console.log("pump OFF");
                            publishToMQTT("esp32/waterpump/command", "OFF");
                            storePumpStatus(0, "OFF");
                            socket.send("{ \"status\": \"WaterPump OFF success\", \"message\": \"WaterPump OFF\" }");
                        }
                    }
                    else if (jsonMsg.type === "timelapse") {
                        console.log("timelapse");
                        //timelapse영상제작
                    }
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

// express 변경하면 지움
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
