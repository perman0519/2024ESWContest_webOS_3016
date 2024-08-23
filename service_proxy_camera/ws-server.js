const WebSocket = require('ws');
const fs = require('fs');
const { Image } = require('canvas');

// 이미지 유효성 검사 함수
function isValidImage(imageBuffer) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageBuffer;
    });
}

// WebSocket 서버 생성

export const startWsServer = () => {
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

// export const stopWsServer = () => {
//     if (wss) {
//         wss.close(() => {
//             console.log('웹소켓 서버가 종료되었습니다.');
//         });
//     } else {
//         console.log('서버가 실행 중이 아닙니다.');
//     }
// }
