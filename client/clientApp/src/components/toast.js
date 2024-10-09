import LS2Request from '@enact/webos/LS2Request';

const webOSBridge = new LS2Request();

const onToastSuccess = (msg) => {
	console.log(msg);
}

const onToastFailure = (msg) => {
	console.log(msg);
}

export const createToast = (msg) => {
	const parms = {
			"message": `"${msg}"`
	}
	const lsRequest = {
			"service":"luna://com.webos.notification",
			"method":"createToast",
			"parameters": parms,
			"onSuccess": onToastSuccess,
			"onFailure": onToastFailure
	};
	webOSBridge.send(lsRequest);
}
