// const axios = require('axios');

// // 사용자 프롬프트를 분석하여 피처(줄기 길이, 엽폭)를 추출하는 함수
// function extractFeaturesFromPrompt(prompt) {
//     const matches = prompt.match(/\d+/g);  // 숫자만 추출
//     return matches ? matches.map(Number) : [];
// }

// // Flask API에 POST 요청을 보내 예측값을 받아오는 함수
// async function callRandomForestModel(features) {
//     try {
//         const response = await axios.post('http://54.180.187.212:5000/predict', {
//             features: features  // 줄기 길이와 엽폭 데이터를 전송
//         });
//         return response.data.prediction;
//     } catch (error) {
//         console.error('API 요청 중 오류 발생:', error);
//         return null;
//     }
// }

// // 사용자 입력 처리 대신에, 데이터베이스에서 길이, 나이, 센서값 전달. && 예측값 반환
// async function handleUserPrompt(prompt) {

//     const features = extractFeaturesFromPrompt(prompt);  // 프롬프트에서 피처 추출

//     if (features.length === 2) {

//         const prediction = await callRandomForestModel(features);
//         console.log(`예측된 물 주기 횟수: ${prediction}`);

//     } else {
//         console.log('올바른 입력을 제공해주세요 (예: 줄기 길이 15, 엽폭 10).');
//     }
// }

// // 사용자 프롬프트 예시
// const userPrompt = '이번 주 현재 줄기 길이 27, 엽폭 11를 목표로 하는  식물의 물 주기 횟수를 예측해줘';
// handleUserPrompt(userPrompt);


const axios = require('axios');  // axios 임포트 // 추가
const { ref,  query, orderByKey, limitToLast, get } = require('firebase/database');
const initializeApp = require('firebase/app').initializeApp;
const getDatabase = require('firebase/database').getDatabase;

const firebaseConfig = {
    apiKey: "AIzaSyBfc8OlhEQ-wIpNL3l2v-mTRPVl0droKRY",
    authDomain: "smartfarm-ddbc3.firebaseapp.com",
    databaseURL: "https://smartfarm-ddbc3-default-rtdb.firebaseio.com",
    projectId: "smartfarm-ddbc3",
    storageBucket: "smartfarm-ddbc3.appspot.com",
    messagingSenderId: "945689382597",
    appId: "1:945689382597:web:77f9a7c6eff9c5d445aaac"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 예측 결과를 자연어로 변환하는 함수
async function convertPredictionToNaturalLanguage(prediction) {
    //TODO: 요청하는 자연어를 더 자연스럽게 다듬어야한다
    //const prompt = 
    //'예측된 물 주기 양은' + prediction + '입니다. 이 값을 자연스러운 한국어 문장으로 변환하세요.';
    const prompt = 
    `예측된 물 주기 양은 ${prediction} 입니다. 이 값을 자연스러운 한국어 문장으로 변환하세요.`;


    console.log("prompt: ", prompt);

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

// 파이썬 코드로 학습된 모델 호출 후 추론 결과 가져오기.
// Flask API에 POST 요청을 보내 예측값을 받아오는 함수
async function callRandomForestModel() { //인자로 ['온도', '습도', '일조량']
    const features = ['26', '60', '5']; //TODO: DB에서 읽어오도록 수정해야함
    const test = getLatestSensorData();
    console.log("getSenSorData Latest: ", test);
    try {
        const response = await axios.post('http://54.180.187.212:5000/predict', {
            features: features  // 줄기 길이와 엽폭 데이터를 전송
        }); //response에 물주기양을 반환하도록 되어있음

        console.log('서버 응답 전체:', response.data.prediction);

        // // 도출된 결과 자연어로 변경하는 함수
        convertPredictionToNaturalLanguage(response.data.prediction)
            .then((naturalLanguageResponse) => {
                console.log("자연어로 변환된 응답:", naturalLanguageResponse);
            })
            .catch((error) => {
                console.error("자연어 변환 중 오류 발생:", error);
            });

        //message.respond({
         //   returnValue: true,
          //  Response: "Sensor data stored"
        //});
            
        // return response;
    } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        // return null;
    }
}

//gpt가 생성한 최신데이터 가져오는 함수
async function getLatestSensorData() {
    try {
        const sensorDataRef = query(ref(database, 'sector/0/sensorData'), orderByKey(), limitToLast(1));
        
        const snapshot = await get(sensorDataRef);

        if (snapshot.exists()){
            const data = snapshot.val();
            let latestData = null;

            for (let key in data){
                latestData = data[key];
            }

            console.log("Fetched latest sensor data: ", latestData);
            return latestData;
        }
        else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
    }    
}




// function getSensorDataFromDB(database, ref, onValue)
// {
//     return new Promise((resolve, reject) => {
//         const starCountRef = ref(database, 'sector/0/sensorData');
//         onValue(starCountRef, (snapshot) => {
//             const data = snapshot.val();
//             resolve(data);
//         });

//         // database.ref('sensorValue')
//         //     .orderByChild('timestamp') // 타임스탬프 필드를 기준으로 정렬
//         //     .startAt(startTime) // 주어진 startTime 이후의 데이터만 필터링
//         //     .on('value', (snapshot) => { // 실시간으로 데이터 변경을 감지
//         //         if (snapshot.exists())
//         //         {
//         //             const data = snapshot.val();
//         //             const sensor = [];    // 데이터베이스에 접근해서 데이터를 담아둘 배열

//         //             // 온도 데이터만 추출하여 배열에 저장
//         //             for (let key in data)
//         //             {
//         //                 if (data[key].temperature)
//         //                 {
//         //                     sensor.push(data[key].temperature);
//         //                 }
//         //             }

//         //             console.log(`Fetched sensor after ${startTime}: `, sensor);

//         //             // 데이터를 성공적으로 가져왔으므로 resolve 호출
//         //             resolve(sensor);
//         //         }
//         //         else
//         //         {
//         //             console.log("No data available after the specified time");
//         //             resolve([]); // 데이터가 없으면 빈 배열을 반환
//         //         }
//         //     }, (error) => {
//         //         console.error("Error fetching data: ", error);
//         //         reject(error); // 에러 발생 시 Promise를 reject로 처리
//         //     });
//     });
// }




// data값은 순서대로 온도, 습도, 일조량
// const data = ['26', '60', '5'];

callRandomForestModel();
