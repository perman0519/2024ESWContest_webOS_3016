
// const OpenAI = require('openai');
// const { spawn } = require('child_process');

// const openai = new OpenAI({
//     apiKey: "" // OpenAI API 키 설정
// });

// // GPT-4 API 호출 함수
// async function getGpt4Response(userInput) {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4", // GPT-4 모델 지정
//             messages: [
//                 { role: "system", content: "you are an advisor who guides you on how to change the temperature and humidity according to the growth information of plants" },
//                 { role: "user", content: userInput },
//             ],
//         });

//         if (response.choices && response.choices.length > 0) {
//             return response.choices[0].message.content;
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error with GPT-4 API call:", error.response ? error.response.data : error.message);
//         throw error; // 오류를 다시 던져서 호출자에게 전달
//     }
// }

// // Python 스크립트 호출 함수
// function callRandomForestModel(features) {
//     return new Promise((resolve, reject) => {
//         const pythonProcess = spawn('python3', ['predict.py', ...features]);

//         pythonProcess.stdout.on('data', (data) => {
//             resolve(data.toString().trim());
//         });

//         pythonProcess.stderr.on('data', (data) => {
//             reject(`Error: ${data}`);
//         });
//     });
// }

// // 사용자 프롬프트를 처리하는 함수
// async function handleUserPrompt(prompt) {
//     if (prompt.includes('물 주기')) {
//         // console.log('1');
//         const features = extractFeaturesFromPrompt(prompt);  // 입력값 추출

//         try {
//             const prediction = await callRandomForestModel(features);  // Python 호출
//             console.log(`예측된 물 주기 횟수: ${prediction}`);
//         } catch (error) {
//             console.error('예측 중 오류 발생:', error);
//         }
//     }
// }

// // 프롬프트에서 피처(특성)를 추출하는 함수
// // function extractFeaturesFromPrompt(prompt) {
// //     const features = prompt.match(/\d+/g).map(Number);
// //     return features;
// // }

// // function extractFeaturesFromPrompt(prompt) {
// //     const regex = /(\d+\.?\d*)/g; // 정수 및 소수를 모두 포함하는 숫자 매치 정규 표현식
// //     const features = prompt.match(regex)?.map(Number) || []; // 안전하게 매치된 결과 처리
// //     return features;
// // }

// function extractFeaturesFromPrompt(prompt) {
//     // 줄기 길이, 엽폭, 습도, 온도, 나이를 정규 표현식을 사용하여 추출
//     const lengthMatch = prompt.match(/줄기 길이:\s*(\d+)/);
//     const leafWidthMatch = prompt.match(/엽폭:\s*(\d+)/);
//     const humidityMatch = prompt.match(/습도:\s*(\d+)/);
//     const temperatureMatch = prompt.match(/온도:\s*(\d+)/);
//     const ageMatch = prompt.match(/나이:\s*(\d+)/);

//     // 값을 배열로 반환 (cm, %, K, weeks는 사용자가 필요에 따라 변환)
//     return [
//         lengthMatch ? parseFloat(lengthMatch[1]) : 0, // 줄기 길이
//         leafWidthMatch ? parseFloat(leafWidthMatch[1]) : 0, // 엽폭
//         humidityMatch ? parseFloat(humidityMatch[1]) : 0, // 습도
//         temperatureMatch ? parseFloat(temperatureMatch[1]) : 0, // 온도
//         ageMatch ? parseFloat(ageMatch[1]) : 0 // 나이
//     ];
// }

// // // 전체 흐름 처리
// // async function fullProcess(userInput) {
// //     try {
// //         const gptResponse = await getGpt4Response(userInput);
// //         if (gptResponse && gptResponse.includes("물 주기")) {
// //             await handleUserPrompt(gptResponse);
// //         }
// //     } catch (error) {
// //         console.error('전체 프로세스 중 오류 발생:', error);
// //     }
// // }

// async function fullProcess(userInput) {
//     try {
//         const gptResponse = await getGpt4Response(userInput);
//         console.log("GPT 응답:", gptResponse);

//         if (gptResponse) {
//             await handleUserPrompt(gptResponse);
//         } else {
//             console.log("응답이 없습니다.");
//         }
//     } catch (error) {
//         console.error('전체 프로세스 중 오류 발생:', error);
//     }
// }


// // 사용자 입력 예시
// // const userPrompt = '줄기 길이 15, 엽폭 10인 식물의 물 주기 횟수를 예측해줘, 습도가 50%, 온도가 296K, 나이가 2주일 때, 얼마나 물을 줘야 하나요?';
// const userPrompt = '종: 양상추, 줄기 길이: 15cm, 엽폭: 10cm, 습도: 50%, 온도: 296K, 나이: 2주 물 주기 횟수를 예측해줘';

// fullProcess(userPrompt).catch(err => {
//     console.error('앱 실행 중 오류 발생:', err);
// });


// // const { Configuration, OpenAIApi } = require("openai");
// const OpenAI = require('openai');
// const { exec } = require("child_process");
// // require('dotenv').config();

// // // OpenAI API 설정
// // const configuration = new Configuration({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });

const axios = require('axios');  // axios 임포트
const { exec } = require('child_process');
const fs = require('fs');

// 파이썬 코드 생성하는 함수
async function getGeneratedPythonCode(prompt) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a Python coding assistant.' },
            { role: 'user', content: prompt } // content로 prompting한 내용이 들어감
        ],
        max_tokens: 2000,
        temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer `,  // 실제 API 키 사용
            'Content-Type': 'application/json'
        }
    });

    // 응답 내용 출력
    const fullResponse = response.data.choices[0].message.content;
    console.log("전체 응답:", fullResponse);  // 응답 내용 확인

    // Python 코드 추출
    const codeMatch = fullResponse.match(/```(?:python)?\n([\s\S]*?)\n```/);
    if (codeMatch && codeMatch[1]) {
        return codeMatch[1].trim(); // Python 코드만 반환
    } else {
        throw new Error(`Python 코드를 찾을 수 없습니다. 응답 내용: ${fullResponse}`);
    }
}

// 예측 결과를 자연어로 변환하는 함수
async function convertPredictionToNaturalLanguage(prediction) {
    const prompt = `
    예측된 물 주기 양은 ${prediction} ml입니다.
    이 값을 자연스러운 한국어 문장으로 변환하세요.
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
            { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer `,  // 실제 API 키 사용
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].message.content.trim();
}

// 자연어 문제를 Python 코드로 변환하는 예제
// const naturalLanguageQuestion = "다음 주에 식물에 얼마나 물을 줘야 할까?";

// 전역변수화 해서 처리하는 구문
const naturalLanguageQuestion = "으잉?"; // 문제로 던져줌.
const pythonCodePrompt = `
문제: ${naturalLanguageQuestion}
이 문제를 해결하기 위한 Python 프로그램을 생성하세요. 이 프로그램은 사전에 훈련된 회귀 모델을 사용하여 식물의 피처 데이터를 기반으로 물 주기 양을 예측해야 합니다. 반환할 코드는 반드시 Python 코드 블록 안에 작성해 주세요. 또한, 설명이나 코드를 포함하지 말고 오직 Python 코드만 반환해 주세요.

\`\`\`python
import numpy as np
import joblib

# 훈련된 회귀 모델을 불러옵니다.
model = joblib.load('regression_model.pkl')

# 식물의 피처 데이터를 numpy 배열로 만듭니다.
# 예: [온도, 습도, 일조량]
# 여기에 실제 피처 값을 입력하세요.
온도 = 21  # 실제 값 입력
습도 = 32  # 실제 값 입력
일조량 = 6  # 실제 값 입력

# 예측할 데이터 생성 (pandas DataFrame 사용)
features = pd.DataFrame([[temperature, humidity, sunlight]], columns=['온도', '습도', '일조량'])

# 물 주기 양을 예측합니다.
predicted_water_amount = model.predict(features)

# 예측된 물 주기 양을 출력합니다.
print(predicted_water_amount[0])  # 예측된 양을 출력합니다.
\`\`\`
`;

// 파이썬 코드 생성하는 함수가 실행이 된다면,
getGeneratedPythonCode(pythonCodePrompt)
    .then((generatedCode) => {
        // 피처 이름 영어를 한글로 바꾸기
        const correctedCode = generatedCode
        .replace(/temperature/g, '온도')
        .replace(/humidity/g, '습도')
        .replace(/sunlight/g, '일조량');

        console.log("생성된 Python 코드:\n", correctedCode);

        // 생성된 Python 코드를 파일로 저장
        fs.writeFileSync('generated_code.py', correctedCode);

        // 저장한 Python 코드를 실행
        exec('python3 generated_code.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Python 코드 실행 중 오류 발생: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Python 코드 stderr: ${stderr}`);
                return;
            }

            // Python 실행 결과를 기반으로 예측된 값 받기
            const prediction = stdout.trim();
            console.log(`예측된 물 주기 양: ${prediction} ml`);

            // 도출된 결과 자연어로 변경하는 함수
            convertPredictionToNaturalLanguage(prediction)
                .then((naturalLanguageResponse) => {
                    console.log("자연어로 변환된 응답:", naturalLanguageResponse);
                })
                .catch((error) => {
                    console.error("자연어 변환 중 오류 발생:", error);
                });
        });
    })
    .catch((error) => {
        console.error("오류 발생:", error);
    });





