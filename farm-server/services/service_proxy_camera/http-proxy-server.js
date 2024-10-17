const { database }  = require('./firebase.js');
const { onValue, child, get, ref, query, orderByKey, limitToLast, push, update, set } = require('firebase/database');
const express = require('express');
const fs = require('fs');
const { Z_ASCII } = require('zlib');
const mqtt = require('mqtt');
const axios = require('axios');  // axios 임포트 추가

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8081;

// Placeholder image path
const placeholderImagePath = '/media/internal/placeholder.jpeg'
const imagePath = '/media/internal/stream.jpeg'

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/api/sectors', async (req, res) => {
    const sectorsRef = ref(database, 'sector');

    try {
      const snapshot = await get(child(sectorsRef, '/'));
      if (snapshot.exists()) {
        const data = snapshot.val();

        const formattedData = data.map(sector => ({
          uid: sector.uid || '',
          plant: {
            createdAt: sector.plant?.createdAt || '',
            name: sector.plant?.name || ''
          }
        }));

        res.json(formattedData);
      } else {
        res.status(404).json({ message: "No data available" });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/timelapse', (req, res) => {
    const imageList = fs.readdirSync('/tmp/usb/sda/sda2/sector/0');
    res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');

    const sendImage = (imagePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(imagePath, (err, imageBytes) => {
                if (err) {
                    console.error('Error reading image file:', err);
                    const placeholderImagePath = path.join(__dirname, 'placeholder.jpg'); // 플레이스홀더 이미지 경로 설정
                    fs.readFile(placeholderImagePath, (placeholderErr, placeholderBytes) => {
                        if (placeholderErr) {
                            console.error('Error reading placeholder file:', placeholderErr);
                            reject(placeholderErr);
                            return;
                        }
                        res.write('--frame\r\n');
                        res.write('Content-Type: image/jpeg\r\n\r\n');
                        res.write(placeholderBytes);
                        res.write('\r\n');
                        resolve();
                    });
                } else {
                    res.write('--frame\r\n');
                    res.write('Content-Type: image/jpeg\r\n\r\n');
                    res.write(imageBytes);
                    res.write('\r\n');
                    resolve();
                }
            });
        });
    };

    const streamImages = async () => {
        for (const image of imageList) {
            console.log('Sending image:', image);
            await sendImage('/tmp/usb/sda/sda2/sector/0/' + image);
            await new Promise(resolve => setTimeout(resolve, 50)); // 0.5초 대기
        }
        res.end(); // 모든 이미지 전송 후 연결 종료
    };

    streamImages().catch(error => {
        console.error('Error in streamImages:', error);
        res.end(); // 오류 발생 시 연결 종료
    });
});

app.get('/api/sensor/:id', (req, res) => {
    const sectorId = req.params.id;
    const sensor = ref(database, `sector/${sectorId}/sensorData`);
    onValue(sensor, (snapshot) => {
      const data = snapshot.val();
      res.json(data);
    }, (error) => {
      console.error('Error fetching sensor data:', error);
      res.status(500).json({ error: 'Failed to fetch sensor data' });
    });
});

app.get('/api/sensor/latest/:sectorId', async (req, res) => {
    const sectorId = req.params.sectorId;

    try {
      const sensorDataRef = query(ref(database, `sector/${sectorId}/sensorData`), orderByKey(), limitToLast(1));
      const snapshot = await get(sensorDataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let latestData = null;
        for (let key in data) {
          latestData = { timestamp: key, ...data[key] };
        }
        console.log(`Fetched latest sensor data for sector ${sectorId}:`, latestData);
        res.json(latestData);
      } else {
        console.log(`No data available for sector ${sectorId}`);
        res.status(404).json({ message: "No data available" });
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
});

app.patch('/api/sector/:id', (req, res) => {
    const sectorId = req.params.id;
    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided in the request body' });
    }

    const sectorRef = ref(database, `sector/${sectorId}`);

    update(sectorRef, updates)
    .then(() => {
      console.log(`Updated sector data for id ${sectorId}:`, updates);
      res.json({ message: `Sector data for id ${sectorId} updated successfully`, updatedFields: updates });
    })
    .catch((error) => {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Failed to update sector data' });
    });
});

app.get('/api/sector/:id', async (req, res) => {
    const sectorId = req.params.id;

    const sectorRef = ref(database, `sector/${sectorId}`);
    try {
      const snapshot = await get(sectorRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        res.json(data);
      } else {
        res.status(404).json({ message: "No data available" });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/api/sub-list/:uid', async (req, res) => {
    const uid = req.params.uid;
    const subListRef = ref(database, `sector`);

    try {
        const snapshot = await get(subListRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const result = Object.entries(data)
            .filter(([_, sector]) => sector.uid === uid)
            .map(([index, sector]) => ({
              id: index,
              name: sector.plant?.name || ''
            }));
            res.json(result);
        } else {
            res.status(404).json({ message: "No data available" });
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
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
    }, 500); // Adjust the interval time as needed

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

// // Flask 서버에 update 요청을 보내는 엔드포인트 추가
app.post('/api/harvest/:sectorId', async (req, res) => {
  const sectorId = req.params.sectorId;
  try {
      const flaskUrl = 'http://54.180.187.212:5000/update';  // Flask 서버의 엔드포인트
      const dataToSend = {
          sectorID: `${sectorId}`  //TODO: 클라이언트로부터 받는 섹터번호
      };

      console.log("harvest");
      // Flask 서버에 POST 요청 보내기
      const flaskResponse = await axios.post(flaskUrl, dataToSend);

      // Flask 서버의 응답 처리
      if (flaskResponse.status === 200) {
        console.log("harvest");

        // delete firebase data
        const sectorRef = ref(database, `sector/${sectorId}`);
        update(sectorRef, {
          plant: null,
          sensorData: null,
          uid : null
        });
        const imageList = fs.readdirSync(`/tmp/usb/sda/sda2/sector/${sectorId}`);
        for (const image of imageList) {
          fs.unlinkSync(`/tmp/usb/sda/sda2/sector/${sectorId}/${image}`);
        }

        console.log("Flask 서버로 성공적으로 요청을 보냈습니다:", flaskResponse.data);
        res.json({ message: "Flask 서버로 업데이트 요청을 성공적으로 보냈습니다." });

      } else {
          console.error("Flask 서버 응답 오류:", flaskResponse.status);
          res.status(500).json({ error: "Flask 서버 응답 오류" });
      }
  } catch (error) {
      console.error("Flask 서버로 요청 보내기 실패:", error);
      res.status(500).json({ error: "Flask 서버로 요청 보내기 실패" });
  }
});

// db에 저장된 ai추론 결과 가져오는 엔드포인트 추가
app.get('/api/prompt/:sectorId', async (req, res) => {
  const sectorId = req.params.sectorId;
  const plantRef = ref(database, `sector/${sectorId}/plant`);

  try {
    // 데이터를 비동기적으로 가져옴
    const snapshot = await get(plantRef);

    if (snapshot.exists()) {
      const plantData = snapshot.val();
      console.log('Fetched plant data:', plantData);  // plantData 로그

      if (plantData.prompt) {
        res.json({ prompt: plantData.prompt });
      } else {
        res.status(404).json({ error: 'Prompt not found' });
      }
    } else {
      res.status(404).json({ message: "No data available" });
    }
  } catch (error) {
    console.error('Error fetching plant prompt:', error);
    res.status(500).json({ error: 'Failed to fetch plant prompt' });
  }
});

app.post('/api/arduino', async (req, res) => {
    const type = req.body.type;
    const userId = req.body.user_id;
    const sectorId = req.body.sector_id;
    const command = req.body.command;
    console.log("req.body: ", req.body);
    const mqtt_host = "54.180.187.212";
    const mqtt_port = "8000";
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100);

    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    client.on('connect', function () {
        console.log("mqtt Connected to MQTT broker");
    });

    client.on('error', function (err) {
        console.log("mqtt Connection failed: ", err.message);
    });

    const topic = `esp32/${type}/command`;
    client.publish(topic, command, {qos : 1}, function (err){
        if (!err){
            console.log(`topic publish success : ${topic}`);
        }
        else {
            console.log("publish failed: ", err.message);
        }
        client.end();
    });

    const commandRef = ref(database, `sector/${sectorId}/LED_Status/`);
    set(commandRef, {
        status: command,
    })
    .then(() => {
        console.log("Firebase 저장 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });

    res.json({ message: "Command sent successfully" });
});

const startHttpServer = () => {
    app.listen(port, () => {
    console.log(`MJPEG streaming server running at http://0.0.0.0:${port}`);
    });
}

// startHttpServer();
module.exports = { startHttpServer };
