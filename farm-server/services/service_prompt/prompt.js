import OpenAI from 'openai';

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
    apiKey: ""
});

async function getGpt4Response() {
  try {
    // GPT-4 모델을 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4", // GPT-4 모델 지정
      messages: [
        { role: "system", content: "you are an advisor who guides you on how to change the temperature and humidity according to the growth information of plants" },
        { role: "user", content: "species: rettuce, length: 7cm, humidity: 50%, temperature: 296K, age: 2weeks" },
      ],
    });

    // 응답 출력
    // console.log(response.data.choices[0].message.content);
    console.log(response);
    
    // 응답 출력
    if (response.choices && response.choices.length > 0) {
        console.log(response.choices[0].message.content);
      } else {
        console.log("No choices found in response");
      }
  } catch (error) {
    console.error("Error with GPT-4 API call:", error.response ? error.response.data : error.message);
  }
}

// 함수 호출
getGpt4Response();
