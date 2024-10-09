const pkgInfo = require('./package.json');
const Service = require('webos-service');
const { database } = require('./firebase.js');
const { onValue, get, set, ref } = require('firebase/database');

const service = new Service(pkgInfo.name);
const logHeader = "[" + pkgInfo.name + "]";

const axios = require("axios");
const fs = require("fs");
const calculatePixelHeight = (bbox) => {
    return bbox.height;
}

const establishConversionFactor = (referenceHeight, referencePixelHeight) => {
    return referenceHeight / referencePixelHeight;
}

function getLocalTimestamp() {
    const now = new Date();
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
}

async function getPlantLength(message) {

    const imageList = fs.readdirSync('/media/multimedia/sector/0');
    const latestImage = imageList[imageList.length - 1];

    const image = fs.readFileSync('/media/multimedia/sector/0/' + latestImage, {
        encoding: "base64"
    });
    console.log("image: ", image);
    console.log("latestImage: ", latestImage);

    console.log(logHeader, "SERVICE_METHOD_CALLED:/getPlantLength");
    try {
        const response = await axios({
            method: "POST",
            url: "https://detect.roboflow.com/plant-length/1",
            params: {
                api_key: "RHUq6ZDE5t0JQkwjks14"
            },
            data: image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        console.log(response.data);
        const referenceBBox = response.data.predictions.find(item => item.class === 'ref');
        const plantBBox = response.data.predictions.find(item => item.class === 'plant');

        let plantHeightCM = 0;
        if (!referenceBBox || !plantBBox) {
            plantHeightCM = 0;
        }
        else {
            const referencePixelHeight = calculatePixelHeight(referenceBBox);
            const referenceHeightCM = 5;

            const conversionFactor = establishConversionFactor(referenceHeightCM, referencePixelHeight);

            console.log("conversion: ", conversionFactor);

            const plantPixelHeight = calculatePixelHeight(plantBBox);
            plantHeightCM = plantPixelHeight * conversionFactor;
            console.log("식물의 길이: ", plantHeightCM);
        }

        const lengthRef = ref(database, `sector/0/plant/length/`);
        const snapshot = await get(lengthRef);
        const existingData = snapshot.val() || {};
        const timeStamp = getLocalTimestamp();

        if (!existingData[timeStamp]) {
            existingData[timeStamp] = plantHeightCM;
            try {
                await set(lengthRef, existingData);
                console.log("데이터가 성공적으로 업데이트되었습니다.");
                message.respond({
                    returnValue: true,
                    Response: `{"plant_length" : "${plantHeightCM}"}`
                });
            } catch (error) {
                console.error("데이터 업데이트 중 오류 발생: ", error);
                message.respond({
                    returnValue: false,
                    Response: `{"plant_length" : "${plantHeightCM}"}`
                });
            }
        } else {
            console.log("동일한 타임스탬프의 데이터가 이미 존재합니다. 건너뜁니다...");
        }
    } catch (e) {
        message.respond({
            returnValue: false,
            Response: "error"
        });
    }
}

service.register("getPlantLength", getPlantLength);
