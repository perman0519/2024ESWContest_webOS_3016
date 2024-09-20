const WebSocket = require("ws");
const pkgInfo = require('./package.json');
const serviceInfo = require('./services.json')
const Service = require('webos-service');
const service = new Service(pkgInfo.name);

const mqtt = require('mqtt');

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
function sensorControlServer(message) {
    console.log("In sensorControlServer callback");

    try {
        if (!serverStarted) {
            const wss = new WebSocket.Server({ port: 3001 });
            wss.on("connection", (socket) => {
                socket.on("close", () => {
                });
                    console.log("Connection closed");
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
                            console.log("pump OFF");
                            publishToMQTT("esp32/waterpump/command", "OFF");
                        }
                    }
                    socket.send("WebSocket server is running");
                });
            });
            serverStarted = true;
        } else {
            console.log("WebSocket is already started.");
        }
    } catch (e) {
        console.log("Error in sensorControlServer:", e);
    }
    message.respond({
        returnValue: true,
        Response: "ok port 3001"
    });
}

service.register("sensorControlServer", sensorControlServer);
