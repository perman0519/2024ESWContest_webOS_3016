const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8081;

// Placeholder image path
const placeholderImagePath = path.join(__dirname, 'placeholder.jpeg');
const imagePath = path.join(__dirname, 'stream.jpeg');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
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
    }, 1000); // Adjust the interval time as needed

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
