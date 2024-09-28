const { spawn } = require('child_process');

// Python 스크립트 호출 함수
function callRandomForestModel(features) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['predict.py', ...features]);

        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString().trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(`Error: ${data}`);
        });
    });
}

// 사용자 프롬프트를 처리하는 함수
async function handleUserPrompt(prompt) {
    if (prompt.includes('물 주기')) {
        const features = extractFeaturesFromPrompt(prompt);  // 입력값 추출

        try {
            const prediction = await callRandomForestModel(features);  // Python 호출
            console.log(`예측된 물 주기 횟수: ${prediction}`);
        } catch (error) {
            console.error('예측 중 오류 발생:', error);
        }
    }
}

// 프롬프트에서 피처(특성)를 추출하는 함수
function extractFeaturesFromPrompt(prompt) {
    const features = prompt.match(/\d+/g).map(Number);
    return features;
}

// 사용자 입력 예시
const userPrompt = '줄기 길이 15, 엽폭 10인 식물의 물 주기 횟수를 예측해줘';
handleUserPrompt(userPrompt);