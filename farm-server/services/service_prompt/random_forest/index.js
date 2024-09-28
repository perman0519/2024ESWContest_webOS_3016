// const OpenAI = require('openai'); 
// const { spawn } = require('child_process');

// const openai = new OpenAI({
//     apiKey: "sk-CWHhS0LteeiqGXc8A_LzHrYIY1lCehmU7UNjVdopkwT3BlbkFJFT8hQMQAYIZI1L_M9JTGTxqqz4-OeiI_jWtAXFmfoA" // OpenAI API 키 설정
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
//     console.log("1");
//     if (prompt.includes('물 주기')) {
//         console.log("2");
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
// function extractFeaturesFromPrompt(prompt) {
//     const features = prompt.match(/\d+/g).map(Number);
//     return features;
// }

// // 전체 흐름 처리
// async function fullProcess(userInput) {
//     const gptResponse = await getGpt4Response(userInput);
//     if (gptResponse && gptResponse.includes("물 주기")) {
//         await handleUserPrompt(gptResponse);
//     }
// }

// // 사용자 입력 예시
// const userPrompt = 'species: lettuce, length: 7cm, humidity: 50%, temperature: 296K, age: 2weeks';
// fullProcess(userPrompt);


// // // 사용자 입력 예시
// // const userPrompt = '줄기 길이 15, 엽폭 10인 식물의 물 주기 횟수를 예측해줘';
// // handleUserPrompt(userPrompt);


// const OpenAI = require('openai');
// const { spawn } = require('child_process');

// const openai = new OpenAI({
//     apiKey: "sk-CWHhS0LteeiqGXc8A_LzHrYIY1lCehmU7UNjVdopkwT3BlbkFJFT8hQMQAYIZI1L_M9JTGTxqqz4-OeiI_jWtAXFmfoA" // OpenAI API 키 설정
// });

// // GPT-4 API 호출 함수
// async function getGpt4Response(userInput) {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4", // GPT-4 모델 지정
//             messages: [
//                 { role: "system", content: "You are an advisor who recommends how much water should be given to plants based on their growth information." },
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
//     }
// }

// // 사용자 프롬프트를 처리하는 함수
// async function handleUserPrompt(prompt) {
//     if (prompt.includes('물 주기')) {
//         // 물 주기 횟수를 GPT의 응답에서 직접 추출
//         console.log(`GPT의 권장 물 주기: ${prompt}`);
//     }
// }

// // 전체 흐름 처리
// async function fullProcess(userInput) {
//     const gptResponse = await getGpt4Response(userInput);
//     if (gptResponse) {
//         await handleUserPrompt(gptResponse);
//     }
// }

// // 사용자 입력 예시
// const userPrompt = 'species: lettuce, length: 7cm, humidity: 50%, temperature: 296K, age: 2weeks. How much water should I give?';
// fullProcess(userPrompt);



// const OpenAI = require('openai');
// const { spawn } = require('child_process');

// const openai = new OpenAI({
//     apiKey: "your-openai-api-key" // OpenAI API 키 설정
// });

// // GPT-4 API 호출 함수
// async function getGpt4Response(userInput) {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4", // GPT-4 모델 지정
//             messages: [
//                 { role: "system", content: "You are an advisor who recommends how much water should be given to plants based on their growth information." },
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
//     }
// }

// // 사용자 프롬프트를 처리하는 함수
// async function handleUserPrompt(prompt) {
//     console.log(`GPT의 권장 물 주기: ${prompt}`);
// }

// // 전체 흐름 처리
// async function fullProcess(userInput) {
//     const gptResponse = await getGpt4Response(userInput);
//     if (gptResponse) {
//         await handleUserPrompt(gptResponse);
//     } else {
//         console.log("응답이 없습니다.");
//     }
// }

// // 사용자 입력 예시
// const userPrompt = 'For a lettuce plant with a length of 7cm, humidity of 50%, temperature of 296K, and age of 2 weeks, how much water should I give?';
// fullProcess(userPrompt);


const OpenAI = require('openai');
const { spawn } = require('child_process');

const openai = new OpenAI({
    apiKey: "" // OpenAI API 키 설정
});

// GPT-4 API 호출 함수
async function getGpt4Response(userInput) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4", // GPT-4 모델 지정
            messages: [
                { role: "system", content: "you are an advisor who guides you on how to change the temperature and humidity according to the growth information of plants" },
                { role: "user", content: userInput },
            ],
        });

        if (response.choices && response.choices.length > 0) {
            return response.choices[0].message.content;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error with GPT-4 API call:", error.response ? error.response.data : error.message);
        throw error; // 오류를 다시 던져서 호출자에게 전달
    }
}

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
        // console.log('1');
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
// function extractFeaturesFromPrompt(prompt) {
//     const features = prompt.match(/\d+/g).map(Number);
//     return features;
// }

// function extractFeaturesFromPrompt(prompt) {
//     const regex = /(\d+\.?\d*)/g; // 정수 및 소수를 모두 포함하는 숫자 매치 정규 표현식
//     const features = prompt.match(regex)?.map(Number) || []; // 안전하게 매치된 결과 처리
//     return features;
// }

function extractFeaturesFromPrompt(prompt) {
    // 줄기 길이, 엽폭, 습도, 온도, 나이를 정규 표현식을 사용하여 추출
    const lengthMatch = prompt.match(/줄기 길이:\s*(\d+)/);
    const leafWidthMatch = prompt.match(/엽폭:\s*(\d+)/);
    const humidityMatch = prompt.match(/습도:\s*(\d+)/);
    const temperatureMatch = prompt.match(/온도:\s*(\d+)/);
    const ageMatch = prompt.match(/나이:\s*(\d+)/);

    // 값을 배열로 반환 (cm, %, K, weeks는 사용자가 필요에 따라 변환)
    return [
        lengthMatch ? parseFloat(lengthMatch[1]) : 0, // 줄기 길이
        leafWidthMatch ? parseFloat(leafWidthMatch[1]) : 0, // 엽폭
        humidityMatch ? parseFloat(humidityMatch[1]) : 0, // 습도
        temperatureMatch ? parseFloat(temperatureMatch[1]) : 0, // 온도
        ageMatch ? parseFloat(ageMatch[1]) : 0 // 나이
    ];
}

// // 전체 흐름 처리
// async function fullProcess(userInput) {
//     try {
//         const gptResponse = await getGpt4Response(userInput);
//         if (gptResponse && gptResponse.includes("물 주기")) {
//             await handleUserPrompt(gptResponse);
//         }
//     } catch (error) {
//         console.error('전체 프로세스 중 오류 발생:', error);
//     }
// }

async function fullProcess(userInput) {
    try {
        const gptResponse = await getGpt4Response(userInput);
        console.log("GPT 응답:", gptResponse);

        if (gptResponse) {
            await handleUserPrompt(gptResponse);
        } else {
            console.log("응답이 없습니다.");
        }
    } catch (error) {
        console.error('전체 프로세스 중 오류 발생:', error);
    }
}


// 사용자 입력 예시
// const userPrompt = '줄기 길이 15, 엽폭 10인 식물의 물 주기 횟수를 예측해줘, 습도가 50%, 온도가 296K, 나이가 2주일 때, 얼마나 물을 줘야 하나요?';
const userPrompt = '종: 양상추, 줄기 길이: 15cm, 엽폭: 10cm, 습도: 50%, 온도: 296K, 나이: 2주 물 주기 횟수를 예측해줘';

fullProcess(userPrompt).catch(err => {
    console.error('앱 실행 중 오류 발생:', err);
});




