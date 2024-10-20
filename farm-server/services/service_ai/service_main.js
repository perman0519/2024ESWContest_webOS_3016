// const pkgInfo = require('./package.json');
// const Service = require('webos-service');
// const service = new Service(pkgInfo.name);
const axios = require('axios');  // axios 임포트 // 추가
const { ref,  query, orderByKey, limitToLast, limitToFirst, get, set } = require('firebase/database');
const { database } = require("./firebase.js");
require('dotenv').config({ path: './.env' });

// 예측 결과 - 자연어로 변환하는 함수
async function convertPredictionToNaturalLanguage(prediction) {
    //const prompt =
    //'예측된 물 주기 양은' + prediction + '입니다. 이 값을 자연스러운 한국어 문장으로 변환하세요.';
    const prompt =
    `권장되는 주 당 물주기 횟수는 ${prediction} 회 입니다. 이 값이 소수점일 때 정수로 n ~ n+1로 변환해서
    자연스러운 한국어 문장으로 변환하세요.`;

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
            'Authorization': 'Bearer ' + process.env.GPT_KEY,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].message.content.trim();
}

// 식물의 {주차, 종}을 입력받아서 GPT를 통해서 온도, 습도, 생장습도의 정보와 추천행동을 가이드해주는 함수
// 추천루틴 제공해주는 함수
// 추천행동이란 작물이 클 때 보조해줄 수 있는 행동(영양제나 기타 등등)
async function recommendActionByGpt(week, species) {
    // 시스템 메시지로 대화의 맥락 설정
    const systemMessage = `
    You are an expert assistant for smart farm operators. Your task is to provide short, actionable plant care recommendations, concise within a 200-character limit based on the plant's species, growth stage (age in weeks), and the fact that it is grown in a controlled smart farm environment.
    Please include the following information in Korean:
    1. Optimal temperature range for this plant at its current age.
    2. Ideal humidity levels, considering the smart farm's controlled environment.
    3. Recommended soil moisture range, suitable for automated irrigation systems.
    4. Suggested actions to promote healthy growth, such as nutrient adjustments, light settings, or pruning techniques, taking into account the plant's current age and stage of growth.
    Keep your answers concise, in Korean, and relevant to a smart farm setup.
    `;
    
    // 사용자 메시지 (프롬프트)
    const userMessage = `
    I am growing a ${species} plant in a smart farm, and it is currently in week ${week}. 
    Could you provide short guidelines for maintaining temperature, humidity, soil moisture, and any recommended actions?
    `;

    try {
        // GPT API 호출
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500,  // 응답 길이 제한 (최대 200 토큰으로 설정)
            temperature: 0.7
        }, {
            headers: {
                'Authorization': 'Bearer ' + process.env.GPT_KEY,
                'Content-Type': 'application/json'
            }
        });

        const gptReply = response.data.choices[0].message.content;
        console.log("GPT 추천 내용:", gptReply);

        return gptReply;

    } catch (error) {
        console.error("Error fetching GPT recommendations:", error);
        return null;
    }
}

//gpt가 생성한 최신데이터 가져오는 함수
async function getLatestSensorData(sector) {
    try {
        const sensorDataRef = query(ref(database, `sector/${sector}/sensorData`), orderByKey(), limitToLast(1));

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

async function calculateTimeDifference(sector) {
    try {
        const lastQuery = query(ref(database, `sector/${sector}/sensorData`), orderByKey(), limitToLast(1));
        const firstQuery = query(ref(database, `sector/${sector}/sensorData`), orderByKey(), limitToFirst(1));

        // 첫 번째 값 가져오기
        const firstSnapshot = await get(firstQuery);
        if (!firstSnapshot.exists()) {
            console.error("첫 번째 데이터가 존재하지 않습니다.");
            return undefined;
        }
        const firstData = firstSnapshot.val();
        const firstTimestamp = Object.keys(firstData)[0]; // 첫 번째 타임스탬프 가져오기
        
        console.log("첫번째 날", firstTimestamp);

        // 마지막 값 가져오기
        const lastSnapshot = await get(lastQuery);
        if (!lastSnapshot.exists()) {
            console.error("마지막 데이터가 존재하지 않습니다.");
            return undefined;
        }
        const lastData = lastSnapshot.val();
        const lastTimestamp = Object.keys(lastData)[0]; // 마지막 타임스탬프 가져오기

        console.log("마지막 날", lastTimestamp);

        // 타임스탬프를 Date 객체로 변환
        const firstDate = new Date(firstTimestamp);
        const lastDate = new Date(lastTimestamp);

        // 시간 차이 계산 (밀리초 단위)
        const timeDifference = lastDate - firstDate; // 밀리초 차이
        const weakDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7)) + 1; // 주 차이

        console.log(`몇 주차인지 : ${weakDifference}`);

        return weakDifference;
    } catch (error) {
        console.error("Error fetching data:", error);
        return undefined;
    }
}

/// 파이썬 코드로 학습된 모델 호출 후 추론 결과 가져오기.
// Flask API에 POST 요청을 보내 예측값을 받아오는 함수
//인자로 ['온도', '습도', '일조량']
async function callRandomForestModel(sector) {
    // const features = ['26', '60', '5']; //TODO: DB에서 읽어오도록 수정해야함
    const data = await getLatestSensorData(sector);
    if (data == null)
        return null;
    console.log("getSenSorData Latest: ", data);

    const pre_features = Object.values(data).map(value => value.toString());
    const features = pre_features.slice(1, 3); // 토양습도, 온도 순으로 읽어오기.

    console.log("feature Latest: ", features);

    const week = await calculateTimeDifference(sector);
    const species = await getPlantType(sector);
    console.log('몇 주주 확인 : ' , week);
    console.log('식물의 종 확인 : ', species);

    try {
        const response = await axios.post(`http://54.180.187.212:5000/predict/${species}`, {
            features: features  // 줄기 길이와 엽폭 데이터를 전송
        }); //response에 물주기양을 반환하도록 되어있음

        console.log('서버 응답 1:', response.data.prediction);

        const recommendationResponse = await recommendActionByGpt(week, species); 
        const naturalLanguageResponse = await convertPredictionToNaturalLanguage(response.data.prediction);

        console.log("토마토 관련:", recommendationResponse);
        console.log("자연어로 변환된 응답:", naturalLanguageResponse);
        
        return `${recommendationResponse}\n${naturalLanguageResponse}`;
    } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        return null;
    }
}

async function getPlantType(sector) {
    try {
        const speciesRef = ref(database, `sector/${sector}/plant/name`);
        const snapshot = await get (speciesRef);
        // let plantType = undefined;

        // get(speciesRef).then((snapshot) => {
            if (snapshot.exists()) {
                plantType = snapshot.val();
                console.log("Plant name:", plantType);
                return plantType;
            }
            else{
                console.log("No data available at the specified path.");
                return undefined;
            }
    } catch (error) {
        console.error("Error fetching data:", error);
        return undefined;
    }    
}

// save the prompt results to DB & JS-service func
async function saveAiPromptToDB() {
    console.log("saveAiPromptToDB 메서드 호출됨:", new Date());
    const sectorCountString = query(ref(database, 'sector'), orderByKey(), limitToLast(1));

    try {

        const snapshot = await get(sectorCountString); // 비동기적으로 snapshot 가져오기
        let sectorCount = 0; // sectorCount 변수를 여기서 선언

        if (snapshot.exists()) {
            const data = snapshot.val(); // 가져온 데이터
            const keys = Object.keys(data); // 키 배열 가져오기
            const lastKey = keys[keys.length - 1]; // 마지막 키
            sectorCount = Number(lastKey); // 마지막 숫자 변환
            console.log("값", sectorCount); // 결과 출력
        } else {
            console.log("데이터가 없습니다.");
            return; // 데이터가 없으면 함수 종료
        }

        for (let sector = 0; sector <= sectorCount; sector++) {
            console.log("몇 번 섹터", sector);
            const prompt = await callRandomForestModel(sector);
            console.log("출력 프롬프트", prompt);

            console.log("JS-service 호출:", prompt);

            const promptRef = ref(database, `sector/${sector}/plant/prompt`);

            // save prompt results to DB
            set(promptRef, prompt)
                .then(() => {
                    console.log("prompt updated successfully.");
                })
                .catch((error) => {
                    console.error("prompt updating data: ", error);
                });
        }
        // message.respond({
        //     returnValue: true,
        //     Response: "alarm setting ok"
        // });
    }
    catch (error) {
        console.error("Error saving error: ", error);
        // message.respond({
        //     returnValue: false,
        //     errorText: error.message || "An error occurred."
        // });
    }
}

saveAiPromptToDB();
// service.register("saveAiPromptToDB", saveAiPromptToDB);