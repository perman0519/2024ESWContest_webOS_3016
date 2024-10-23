const fs = require('fs').promises;

function getLocalTimestamp() {
	const now = new Date();
    return now.getFullYear() + '-' +
	String(now.getMonth() + 1).padStart(2, '0') + '-' +
	String(now.getDate()).padStart(2, '0') + '-' +
	String(now.getHours()).padStart(2, '0') + ':' +
	String(now.getMinutes()).padStart(2, '0') + ':' +
	String(now.getSeconds()).padStart(2, '0');
}

async function saveLocal() {
	const timeStamp = getLocalTimestamp();
	const data = await fs.readFile('/media/internal/stream.jpeg');
	// fs.writeFile(`/tmp/usb/sda/sda2/sector/0/${timeStamp}.jpeg`, data);
	fs.writeFile(`/media/multimedia/sector/0/${timeStamp}.jpeg`, data);
	return `${timeStamp}.jpeg`;
}

module.exports = {saveLocal};

// luna-send -n 1 -f luna://com.farm.server.service/startAll '{}'
// luna-send -n 1 -f -a com.farm.server.service luna://com.webos.service.db/putPermissions '{
//  "permissions":[
//  {
//   "operations":{
//     "read":"allow",
//     "create":"allow",
//     "update":"allow",
//     "delete":"allow"
//   },
//   "object":"com.farm.server.service:1",
//   "type":"db.kind",
//   "caller":"com.farm.server.service"
//   }
//  ]
// }'


