const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

service.register("periodicallyCallService", function (msg) {

    console.log("setAlarmService 호출");

    // 주기적 호출 시작
    setInterval(() => {
        service.call("luna://com.farm.server.ai.service/saveAiPromptToDB", {}, (message) => {
            if (message.payload.returnValue)
                console.log("프롬프트 메서드 호출 성공");
            else
                console.log("프롬프트 메서드 호출 실패 : ", message.payload);
        });

        service.call("luna://com.farm.server.plant.measure.service/getPlantLength", {}, (message) => {
            if (message.payload.returnValue)
                console.log("길이측정 메서드 호출 성공");
            else
                console.log("갈이측정 메서드 호출 실패: ", message.payload);
        });
    }, 20000); // 20초마다 호출

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
        msg: "알람이 성공적으로 설정되었습니다."
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


















// const logHeader = "[" + pkgInfo.name + "]";
// let greeting = "Hello, World!";

// // a method that always returns the same value
// service.register("hello", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/hello");
//     console.log("In hello callback");
//     const name = message.payload.name ? message.payload.name : "World";

//     message.respond({
//         returnValue: true,
//         Response: "Hello, " + name + "!"
//     });
// });

// // set some state in the service
// service.register("/config/setGreeting", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/config/setGreeting");
//     console.log("In setGreeting callback");
//     if (message.payload.greeting) {
//         greeting = message.payload.greeting;
//     } else {
//         message.respond({
//             returnValue: false,
//             errorText: "argument 'greeting' is required",
//             errorCode: 1
//         });
//     }
//     message.respond({
//         returnValue: true,
//         greeting: greeting
//     });
// });

// // call another service
// service.register("time", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/time");
//     console.log("time callback");
//     service.call("luna://com.webos.service.systemservice/clock/getTime", {}, function(m2) {
//         console.log(logHeader, "SERVICE_METHOD_CALLED:com.webos.service.systemservice/clock/getTime");
//         const response = "You appear to have your UTC set to: " + m2.payload.utc;
//         console.log(response);
//         message.respond({message: response});
//     });
// });

// // handle subscription requests
// const subscriptions = {};
// let interval;
// let x = 1;
// function createInterval() {
//     if (interval) {
//         return;
//     }
//     console.log(logHeader, "create_interval");
//     console.log("create new interval");
//     interval = setInterval(function() {
//         sendResponses();
//     }, 1000);
// }

// // send responses to each subscribed client
// function sendResponses() {
//     console.log(logHeader, "send_response");
//     console.log("Sending responses, subscription count=" + Object.keys(subscriptions).length);
//     for (const i in subscriptions) {
//         if (Object.prototype.hasOwnProperty.call(subscriptions, i)) {
//             const s = subscriptions[i];
//             s.respond({
//                 returnValue: true,
//                 event: "beat " + x
//             });
//         }
//     }
//     x++;
// }

// // listen for requests, and handle subscriptions via implicit event handlers in call
// // to register
// service.register("heartbeat", function(message) {
//     const uniqueToken = message.uniqueToken;
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat");
//     console.log("heartbeat callback, uniqueToken: " + uniqueToken + ", token: " + message.token);
//     message.respond({event: "beat"});
//     if (message.isSubscription) {
//         subscriptions[uniqueToken] = message;
//         if (!interval) {
//             createInterval();
//         }
//     }
// },
// function(message) {
//     const uniqueToken = message.uniqueToken;
//     console.log("Canceled " + uniqueToken);
//     delete subscriptions[uniqueToken];
//     const keys = Object.keys(subscriptions);
//     if (keys.length === 0) {
//         console.log("no more subscriptions, canceling interval");
//         clearInterval(interval);
//         interval = undefined;
//     }
// });

// // EventEmitter-based API for subscriptions
// // note that the previous examples are actually using this API as well, they're
// // just setting a "request" handler implicitly
// const heartbeat2 = service.register("heartbeat2");
// heartbeat2.on("request", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat2/request");
//     console.log("heartbeat callback");
//     message.respond({event: "beat"});
//     if (message.isSubscription) {
//         subscriptions[message.uniqueToken] = message;
//         if (!interval) {
//             createInterval();
//         }
//     }
// });
// heartbeat2.on("cancel", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat2/cancel");
//     console.log("Canceled " + message.uniqueToken);
//     delete subscriptions[message.uniqueToken];
//     const keys = Object.keys(subscriptions);
//     if (keys.length === 0) {
//         console.log("no more subscriptions, canceling interval");
//         clearInterval(interval);
//         interval = undefined;
//     }
// });

// service.register("ping", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/ping");
//     console.log("Ping! setting up activity");
//     const methodName = "luna://" + pkgInfo.name + "/pong";
//     const activitySpec = {
//         "activity": {
//             "name": "My Activity", // this needs to be unique, per service
//             "description": "do something", // required
//             "background": true,    // can use foreground or background, or set individual properties (see Activity Specification below, for details)
//             "persist": true,       // this activity will be persistent across reboots
//             "explicit": true,      // this activity *must* be completed or cancelled explicitly, or it will be re-launched until it does
//             "callback": {          // what service to call when this activity starts
//                 "method": methodName, // URI to service
//                 "params": {        // parameters/arguments to pass to service
//                 }
//             }
//         },
//         "start": true,             // start the activity immediately when its requirements (if any) are met
//         "replace": true,           // if an activity with the same name already exists, replace it
//         "subscribe": false         // if "subscribe" is false, the activity needs to be adopted immediately, or it gets canceled
//     };
//     service.call("luna://com.webos.service.activitymanager/create", activitySpec, function(reply) {
//         console.log(logHeader, "SERVICE_METHOD_CALLED:com.webos.service.activitymanager/create");
//         const activityId = reply.payload.activityId;
//         console.log("ActivityId = " + activityId);
//         message.respond({msg: "Created activity "+ activityId});
//     });
// });

// service.register("pong", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED:/pong");
//     console.log("Pong!");
//     console.log(message.payload);
//     message.respond({message: "Pong"});
// });

// service.register("/do/re/me", function(message) {
//     console.log(logHeader, "SERVICE_METHOD_CALLED://do/re/me");
//     message.respond({verses:[
//         {doe: "a deer, a female deer"},
//         {ray: "a drop of golden sun"},
//         {me: "a name I call myself"}
//     ]});
// });
