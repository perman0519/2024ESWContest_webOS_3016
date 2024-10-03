const OpenAI = require('openai');
const { spawn } = require('child_process');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: "" // OpenAI API 키 설정
});

// GPT-4 API 호출 함수
async function getGpt4Response(userInput) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4", // GPT-4 모델 지정
            messages: [
                { role: "system", content: "You are an AI model that provides code solutions to perform predictions using a pre-trained regression model." },
                { role: "user", content: `
                ### Instruction ###
Using the pre-trained regression model saved in 'random_forest_model.pkl', write a Python function to predict the number of times a plant should be watered based on its length and age.

Problem:
We have a plant with the following characteristics:
- Length: 25 cm
- Age: 2 years

Use the regression model to predict how many times the plant should be watered.

### Solution ###
Let's write a Python function that loads the model and makes predictions based on the given plant characteristics.
`
                },
                { role: "user", content: userInput },
            ],
        });

        // Python 코드 추출
        if (response.choices && response.choices.length > 0) {
            const fullResponse = response.choices[0].message.content;
            const codeMatch = fullResponse.match(/```python([\s\S]*?)```/);
            if (codeMatch && codeMatch[1]) {
                return codeMatch[1].trim(); // Python 코드만 반환
            } else {
                throw new Error('Python 코드를 찾을 수 없습니다.');
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error with GPT-4 API call:", error.response ? error.response.data : error.message);
        throw error; // 오류를 다시 던져서 호출자에게 전달
    }
}

// Python 스크립트 호출 함수 -> pythonCode를 문자열로 받아서 파일로 생성하고, 실행한다
function callGeneratedPythonCode(pythonCode, features) {
    return new Promise((resolve, reject) => {
        fs.writeFileSync('generated_code.py', pythonCode);

        const pythonProcess = spawn('python3', ['generated_code.py', ...features.map(f => f.toString())]);

        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString().trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(`Error: ${data}`);
        });
    });
}


// GPT-4로 예측 결과를 자연어로 가공하는 함수 추가
async function formatPredictionWithGpt(prediction) {
    const prompt = `
    You are given the following prediction result: "${prediction}".
    Format this prediction into a user-friendly natural language response:
    `;

    // GPT-4 API 호출
    const response = await openai.createCompletion({
        model: 'gpt-4',
        prompt: prompt,
        max_tokens: 100,
    });

    return response.data.choices[0].text.trim();
}

// 사용자 프롬프트를 처리하는 함수
// generateCode가 gpt가 만들어준 응답으로 pythonCode인데 자연어가 섞여들어온다
async function handleUserPrompt(prompt, generateCode) {
    if (prompt.includes('물 주기')) {
        // console.log('1');
        const features = extractFeaturesFromPrompt(prompt);  // 입력값 추출

        try {
            console.log("test");
            const prediction = await callGeneratedPythonCode(generateCode, features);  // Python 코드를 실행
            // console.log("2");
            console.log(`예측된 물 주기 횟수: ${prediction}`);

            // 예측 결과를 자연어로 변환
            const formattedResult = await formatPredictionWithGpt(prediction);
            console.log(`자연어로 변환된 결과: ${formattedResult}`);
      

        } catch (error) {
            console.error('예측 중 오류 발생:', error);
        }
    }
}

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

async function fullProcess(userInput) {
    try {
        const gptResponse = await getGpt4Response(userInput);
        console.log("GPT 응답:", gptResponse); //gpt에게 받은 python코드를 한번 찍어준다

        if (gptResponse) {
            await handleUserPrompt(userInput, gptResponse);
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
