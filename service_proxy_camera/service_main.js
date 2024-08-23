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

// import { startHttpServer } from "./http-proxy-server.js"
// import { startWsServer } from "./ws-server.js";

const WebSocket = require('ws');
const fs = require('fs');
// const { Image } = require('canvas');

// PNG 헤더 확인 함수
function isValidPng(buffer) {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG 파일의 헤더 (8바이트)
    return buffer.slice(0, 8).equals(pngHeader);
}

// JPEG 헤더 확인 함수
function isValidJpeg(buffer) {
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]); // JPEG 파일의 헤더 (3바이트)
    return buffer.slice(0, 3).equals(jpegHeader);
}

// 이미지 유효성 검사 함수 (PNG 및 JPEG 파일용)
function isValidImage(imageBuffer) {
    return isValidPng(imageBuffer) || isValidJpeg(imageBuffer);
}

// WebSocket 서버 생성

const startWSServer = () => {
	const wss = new WebSocket.Server({ port: 3000 });

	wss.on('connection', (ws) => {
		console.log('New client connected');

		ws.on('message', async (message) => {
			// 메시지가 Buffer인 경우
			if (Buffer.isBuffer(message) && message.length > 5000) {
				const isValid = await isValidImage(message);
				if (isValid) {
					// 이미지 저장
					fs.writeFile('stream.jpeg', message, (err) => {
						if (err) {
							console.error('Error saving image:', err);
						} else {
							console.log('Image saved successfully');
						}
					});
				} else {
					console.log('Invalid image');
				}
			}
		});

		ws.on('close', () => {
			console.log('Client disconnected');
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});
	});

	console.log('WebSocket server running on ws://0.0.0.0:3000');
}

service.register("startWSServer", (msg) => {
    startWSServer();

    //heartbeat 구독
    const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true});
    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:3000`
    });
});

const express = require('express');
const path = require('path');

const app = express();
const port = 8081;

// Placeholder image path
const placeholderImagePath = path.join(__dirname, 'placeholder.jpeg');
const imagePath = path.join(__dirname, 'stream.jpeg');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');

    const sendImage = (imagePath) => {
        fs.readFile(imagePath, (err, imageBytes) => {
            if (err) {
                console.error('Error reading image file:', err);
                res.write('--frame\r\n');
                res.write('Content-Type: image/jpeg\r\n\r\n');
                fs.readFile(placeholderImagePath, (err, placeholderBytes) => {
                    if (err) {
                        console.error('Error reading placeholder file:', err);
                        res.end();
                        return;
                    }
                    res.write(placeholderBytes);
                    res.write('\r\n');
                    res.end();
                });
                return;
            }

            res.write('--frame\r\n');
            res.write('Content-Type: image/jpeg\r\n\r\n');
            res.write(imageBytes);
            res.write('\r\n');
        });
    };

    // Continuously send image data
    const intervalId = setInterval(() => {
        sendImage(imagePath);
    }, 1000); // Adjust the interval time as needed

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

const startHttpServer = () => {
    app.listen(port, () => {
    console.log(`MJPEG streaming server running at http://0.0.0.0:${port}`);
});
}

service.register("startHttpServer", (msg) => {
    startHttpServer();

    const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true});
    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:8081`
    });
});
