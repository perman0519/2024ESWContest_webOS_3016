const WebSocket = require('ws');
const fs = require('fs');

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

module.exports = { startWSServer };
