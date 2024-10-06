// eslint-disable-next-line import/no-unresolved
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const fs = require('fs');
const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

const { startWSServer } = require('./ws-server.js');
const { startHttpServer } = require('./http-proxy-server.js');
const { saveLocal } = require('./save_local.js');

service.register("startWSServer", (msg) => {
    startWSServer();

    // //------------------------- heartbeat 구독 -------------------------
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

    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:3000`
    });
});

service.register("startHttpServer", (msg) => {
    startHttpServer();

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

    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:8081`
    });
});

service.register("saveLocal", async (message) => {
    try {
        const img = await saveLocal();
        // console.log("img name: ", img);
        // if (img)
        //     saveImage(img, "0");
        setInterval(async () => {
            const img = await saveLocal();
            // console.log("img name: ", img);
            // if (img)
            //     saveImage(img, "0");
        }, 10000);

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
            Response: "Image stored serive started"
        });
    } catch (error) {
        console.error("Error: ", error);
        message.respond({
            returnValue: false,
            Response: `${error}`
        });
    }
});

service.register("startAll", (msg) => {
    try {
        service.call("luna://com.farm.server.camera.service/startWSServer", {}, (response) => {
            console.log("Call to startWSServer");
            console.log("Message payload:", JSON.stringify(response.payload));
        });
        service.call("luna://com.farm.server.camera.service/startHttpServer", {}, (response) => {
            console.log("Call to startHttpServer");
            console.log("Message payload:", JSON.stringify(response.payload));
        });
        service.call("luna://com.farm.server.camera.service/saveLocal", {}, (response) => {
            console.log("Call to saveLocal");
            console.log("Message payload:", JSON.stringify(response.payload));
        });
    } catch (err) {
        msg.respond({
            returnValue: false,
            Response: `${err}`
        });
    }
    msg.respond({
        returnValue: true,
        Response: "camera service start all"
    });
});

// function saveImage(imageName, sector) {
//     var params = {
//         "objects": [
//             {
//                 "_kind": "com.farm.server.camera.service:1",
//                 "name": imageName,
//                 "sector": sector
//             }
//         ]
//     };
//     service.call("luna://com.webos.service.db/put", params, function(response) {
//         if (response.payload.returnValue === true) {
//             console.log("Image saved successfully");
//         } else {
//             console.log("Failed to save image:", JSON.stringify(response.payload));
// 			throw new Error("Failed to save image: " +  JSON.stringify(response.payload));
//         }
//     });
// }

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
    }, 5000);
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
