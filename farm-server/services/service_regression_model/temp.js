const axios = require('axios');

// 사용자 프롬프트를 분석하여 피처(줄기 길이, 엽폭)를 추출하는 함수
function extractFeaturesFromPrompt(prompt) {
    const matches = prompt.match(/\d+/g);  // 숫자만 추출
    return matches ? matches.map(Number) : [];
}

// Flask API에 POST 요청을 보내 예측값을 받아오는 함수
async function callRandomForestModel(features) {
    try {
        const response = await axios.post('http://54.180.187.212:5000/predict', {
            features: features  // 줄기 길이와 엽폭 데이터를 전송
        });
        return response.data.prediction;
    } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        return null;
    }
}

// 사용자 입력 처리 대신에, 데이터베이스에서 길이, 나이, 센서값 전달. && 예측값 반환
async function handleUserPrompt(prompt) {

    const features = extractFeaturesFromPrompt(prompt);  // 프롬프트에서 피처 추출

    if (features.length === 2) {

        const prediction = await callRandomForestModel(features);
        console.log(`예측된 물 주기 횟수: ${prediction}`);

    } else {
        console.log('올바른 입력을 제공해주세요 (예: 줄기 길이 15, 엽폭 10).');
    }
}

// 사용자 프롬프트 예시
const userPrompt = '이번 주 현재 줄기 길이 27, 엽폭 11를 목표로 하는  식물의 물 주기 횟수를 예측해줘';
handleUserPrompt(userPrompt);