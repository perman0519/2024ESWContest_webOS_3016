const pkgInfo = require('./package.json');
const Service = require('webos-service');

const service = new Service(pkgInfo.name);
const logHeader = "[" + pkgInfo.name + "]";

const axios = require("axios");
const fs = require("fs");

// 나중에는 실제 카메라로 받아온 이미지를 불러와야함.
const image = fs.readFileSync("./test_img.jpg", {
    encoding: "base64"
});

// 픽셀 높이를 계산하는 함수
const calculatePixelHeight = (bbox) => {
    return bbox.height;
}

// 픽셀-센치 변환 계수를 설정하는 함수
const establishConversionFactor = (referenceHeight, referencePixelHeight) => {
    return referenceHeight / referencePixelHeight;
}

async function getPlantLength(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/getPlantLength");

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

    const referencePixelHeight = calculatePixelHeight(referenceBBox);
    const referenceHeightCM = 5;

    const conversionFactor = establishConversionFactor(referenceHeightCM, referencePixelHeight);

    console.log("conversion: ", conversionFactor);

    const plantPixelHeight = calculatePixelHeight(plantBBox);
    const plantHeightCM = plantPixelHeight * conversionFactor;
    console.log("식물의 길이: ", plantHeightCM);

    message.respond({
        returnValue: true,
        Response: `{"plant_length" : "${plantHeightCM}"}`
    });
    // return `{"plant_length" : "${plantHeightCM}"}`
}

// a method that always returns the same value
service.register("getPlantLength", getPlantLength);
