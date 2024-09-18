// const { default: start } = require('mqtt/bin/pub');
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const WebSocket = require('ws');

const service = new Service(pkgInfo.name);
// let wss;
// const wss = new WebSocket.Server({ port: 8080 });

function startWsServer() {
	const wss = new WebSocket.Server({ port: 3000 });

	wss.on('connection', (ws) => {
		console.log('New client connected');
		ws.on('message', async (message) => {
            ws.send('Hello, client!');
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


service.register("startService", (msg) => {
    startWsServer();

    console.log("Server is running on wss://");

    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:3000`
    });
});

// service.register("startService", function(message) {
//     // if (wss) {
//     //     message.respond({
//     //         returnValue: false,
//     //         errorText: "WebSocket server is already running"
//     //     });
//     //     return;
//     // }

//     const wss = new WebSocket.Server({ port: 3000 });

// 	wss.on('connection', (ws) => {
// 		console.log('New client connected');

// 		ws.on('message', async (message) => {
// 			// 메시지가 Buffer인 경우
// 			console.log('Received message:', message.toString());
//             ws.send('Hello, client!');
//         });

// 		ws.on('close', () => {
// 			console.log('Client disconnected');
// 		});

// 		ws.on('error', (error) => {
// 			console.error('WebSocket error:', error);
// 		});
// 	});

// 	console.log('WebSocket server running on ws://0.0.0.0:3000');
// });
