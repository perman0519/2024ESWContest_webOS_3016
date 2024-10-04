const { database }  = require('./firebase.js');
const { onValue, child, get, ref, query, orderByKey, limitToLast, push, update, set } = require('firebase/database');
const express = require('express');
const fs = require('fs');
const { Z_ASCII } = require('zlib');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8081;

// Placeholder image path
const placeholderImagePath = '/media/internal/placeholder.jpeg'
const imagePath = '/media/internal/stream.jpeg'

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
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
    const imageList = fs.readdirSync('/media/multimedia/sector/0');
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
            await sendImage('/media/multimedia/sector/0/' + image);
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

const startHttpServer = () => {
    app.listen(port, () => {
    console.log(`MJPEG streaming server running at http://0.0.0.0:${port}`);
    });
}

startHttpServer();
// module.exports = { startHttpServer };
