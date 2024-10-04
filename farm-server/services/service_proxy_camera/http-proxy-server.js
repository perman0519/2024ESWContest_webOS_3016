const { database }  = require('./firebase.js');
const { onValue } = require('firebase/database');
const databaseRef = require('firebase/database').ref;
const express = require('express');
const fs = require('fs');

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

app.get('/api/sensor', (req, res) => {
    const sensor = databaseRef(database, 'sector/0/sensorData');
    onValue(sensor, (snapshot) => {
      const data = snapshot.val();
      res.json(data);
    }, (error) => {
      console.error('Error fetching sensor data:', error);
      res.status(500).json({ error: 'Failed to fetch sensor data' });
    });
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

// startHttpServer();
module.exports = { startHttpServer };
