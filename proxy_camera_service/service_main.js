/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// helloworld_webos_service.js
// is simple service, based on low-level luna-bus API

// eslint-disable-next-line import/no-unresolved
const pkgInfo = require('./package.json');
const Service = require('webos-service');

const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

// a method that always returns the same value
service.register("hello", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/hello");
    console.log("In hello callback");
    const name = message.payload.name ? message.payload.name : "World";

    message.respond({
        returnValue: true,
        Response: "Hello, " + name + "!"
    });
});

const express = require("express");
const axios = require("axios");
const WebSocket = require('ws');

const app = express();
const port = 3000;

// cors 에러 처리
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// WebSocket 서버 설정
const wss = new WebSocket.Server({ noServer: true });

const MJPEG_SOURCE_URL = "input mjpeg stream server url";

// WebSocket 연결 핸들러
wss.on('connection', (ws) => {
    console.log('Client connected');

    // MJPEG 스트림을 가져와서 WebSocket으로 전달
    axios.get(MJPEG_SOURCE_URL, { responseType: 'stream' }).then(response => {
        const stream = response.data;

        stream.on('data', (chunk) => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log(chunk);
                ws.send(chunk);
            }
        });

        stream.on('end', () => {
            console.log('Stream ended');
            ws.close();
        });

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            ws.close();
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            stream.destroy();
        });
    }).catch(err => {
        console.error('Failed to fetch stream:', err);
        ws.close();
    });
});

// Express 서버 설정
app.get('/', (req, res) => {
    res.send("hello world");
});

service.register("startServer", (msg) => {
    // HTTP 서버와 WebSocket 서버 연결
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use. Please choose another port.`);
            msg.respond({
                returnValue: false,
                Response: `Port ${port} is already in use. Please choose another port.`
            });
            process.exit(1); // 서버 종료
        } else if (err.code === 'EACCES') {
            console.log(`Permission denied. Cannot use port ${port}. Please try a port above 1024.`);
            msg.respond({
                returnValue: false,
                Response: `Permission denied. Cannot use port ${port}. Please try a port above 1024.`
            });
            process.exit(1); // 서버 종료
        } else {
            console.log(`Server error: ${err.message}`);
            msg.respond({
                returnValue: false,
                Response: `Server error: ${err.message}`
            });
            process.exit(1); // 서버 종료
        }
    });
    console.log("start server");

    //heartbeat 구독
    const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true});
    msg.respond({
        returnValue: true,
        Response: `Server is running on http://localhost:${port}`
    });
});

// const cv = require('./lib/opencv.js')

// service.register("analyzePlantHeight", (msg) => {
//     const Moudle = {
//         onRuntimeInitialized() {
//             console.log('OpenCV.js is ready.');
//         }
//     };

//     const inputImg = msg.payload.imgPath;
//     if (!inputImg) {
//         msg.respond({
//             returnValue: false,
//             Response: "Input image is wrong! check please",
//         });
//         return ;
//     }

//     const img = cv.imread(inputImg);
// });

