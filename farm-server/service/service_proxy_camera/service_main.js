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

const { startWSServer } = require('./ws-server.js');
const { startHttpServer } = require('./http-proxy-server.js');

service.register("startWSServer", (msg) => {
    startWSServer();

    //heartbeat 구독
    const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true});
    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:3000`
    });
});

service.register("startHttpServer", (msg) => {
    startHttpServer();

    const sub = service.subscribe('luna://com.heartbeat.app.service/heartbeat', {subscribe: true});
    msg.respond({
        returnValue: true,
        Response: `Server is running on http://0.0.0.0:8081`
    });
});
