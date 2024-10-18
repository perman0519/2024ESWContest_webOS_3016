const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name);
const axios = require('axios');  // axios 임포트 // 추가
const { ref,  query, orderByKey, limitToLast, get, set, transaction } = require('firebase/database');
const { database } = require('./firebase.js');

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
    // const features = ['26', '60', '5']; //TODO: DB에서 읽어오도록 수정해야함
    const data = await getLatestSensorData();
    console.log("getSenSorData Latest: ", data);
    const pre_features = Object.values(data).map(value => value.toString());
    const features = pre_features.slice(1, 3).reverse();
    console.log("feature Latest: ", features);
    // console.log("feature Latest: ", pre_features);

    try {
        const response = await axios.post('http://54.180.187.212:5000/predict', {
            features: features  // 줄기 길이와 엽폭 데이터를 전송
        }); //response에 물주기양을 반환하도록 되어있음

        console.log('서버 응답 1:', response.data.prediction);


        const naturalLanguageResponse = await convertPredictionToNaturalLanguage(response.data.prediction); // await 사용

        console.log("자연어로 변환된 응답:", naturalLanguageResponse);

        return naturalLanguageResponse; // 자연어 변환된 응답 반환


        // // 도출된 결과 자연어로 변경하는 함수
        // convertPredictionToNaturalLanguage(response.data.prediction)
        //     .then((naturalLanguageResponse) => {
        //         console.log("자연어로 변환된 응답:", naturalLanguageResponse);
        //     })
        //     .catch((error) => {
        //         console.error("자연어 변환 중 오류 발생:", error);
        //     });

        // message.respond({
        //    returnValue: true,
        //    Response: "Sensor data stored"
        // });

        // return naturalLanguageResponse;
    } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        return null;
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

async function saveAiPromptToDB(message) {
    try {
        const prompt = await callRandomForestModel();
        console.log("출력 프롬프트", prompt);

        //여기에 db에 저장하는 로직 추가하기
        console.log("JS-service 호출:", prompt);

        const promptRef = ref(database, `sector/0/plant/prompt`);

        set(promptRef, prompt)
            .then(() => {
                console.log("prompt updated successfully.");
            })
            .catch((error) => {
                console.error("prompt updating data: ", error);
            });

        message.respond({
            returnValue: true,
            Response: "alarm setting ok"
        });
    }
    catch (error) {
        console.error("Error saving error: ", error);
        message.respond({
            returnValue: false,
            errorText: error.message || "An error occurred."
        });
    }
}

// saveAiPromptToDB();
service.register("saveAiPromptToDB", saveAiPromptToDB);
