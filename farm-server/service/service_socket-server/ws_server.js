const WebSocket = require("ws");
const Service = require('webos-service');
// const receivedSensorDataService = new Service("com.farm.server.sensor.service");

let serverStarted = false;

const startServer = () => {
    if (!serverStarted) {
        const wss = new WebSocket.Server({ port: 3001 }); //생성하면서 동시에 연결시도
        wss.on("connection", (socket) => {
            socket.on("close", () => {
                console.log("Connection closed");
            });

            socket.on("message", (message) => {
                console.log('Received message:', message);

                // 메시지를 JSON으로 파싱
                // const receivedMessage = JSON.parse(message);
                // receivedSensorDataService.call("luna://com.farm.server.sensor.service/getSensorData", {}, (response) => {
                //     console.log("Call to getSensorData");
                //     console.log("Message payload:", JSON.stringify(response.payload));

                //     // 클라이언트에 응답 전송
                //     socket.send(JSON.stringify(response.payload));
                //     console.log('Sent response message:', JSON.stringify(response.payload));
                // });
                socket.send("WebSocket server is running");
            });
        });
        serverStarted = true;
    } else {
        console.log("WebSocket 서버는 이미 시작되었습니다.");
    }
};

module.exports = { startServer };


