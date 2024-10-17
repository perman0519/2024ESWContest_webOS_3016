const mqtt = require('mqtt');
const { set, onValue, ref } = require('firebase/database');

// 마지막 저장된 시간을 기록하는 변수
let lastSavedTime = 0;

//sensor한테 받은 데이터를 db에 각 해당 sector 하위에 추가.
function updateSectorInfo(database, sensorData)
{
    // 지역 시간 타임스탬프 생성 함수
    function getLocalTimestamp() {
        const now = new Date();
        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
    }

    // 현재 시간 (밀리초 단위로 저장)
    const currentTime = Date.now();

    if (currentTime - lastSavedTime >= 30000) {
        lastSavedTime = currentTime;
        console.log("30초 경과: 데이터를 저장합니다.");

        if (!sensorData || !sensorData.data || isNaN(sensorData.data.humidity) || isNaN(sensorData.data.temperature) || isNaN(sensorData.data.soil_humidity)) {
            console.error("Missing required sensor data: ", sensorData);
        } else {
            console.log("Saving to Firebase: ", sensorData);

            const sector_id = sensorData.sector;
            const timeStamp = getLocalTimestamp();
            console.log(sector_id, timeStamp, `sector/${sector_id}/sensorData/`);
            const sectorValue = ref(database, `sector/${sector_id}/sensorData`);

            const sectorRef = ref(database, `sector/${sector_id}/`); //testing

            onValue(sectorValue, (snapshot) => {
                const existingData = snapshot.val() || {}; // 데이터가 없을 때도 existingData 변수가 객체 형식으로 초기화

                // 새로운 데이터 추가 시, 같은 타임스탬프가 없을 경우에만 추가
                if (!existingData[timeStamp]) {
                    existingData[timeStamp] = sensorData.data; // 새 데이터 추가
                } else {
                    console.log("Data with the same timestamp already exists, skipping...");
                }

                // 업데이트된 데이터를 다시 저장
                set(sectorValue, existingData)
                    .then(() => {
                        console.log("Data updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating data: ", error);
                    });
            });
            
            saveWeekData(sectorRef); //testing
        }
    } else {
        console.log("Skipped saving, waiting for 30 seconds interval.");
    }
}

function receivedMessage(message, database) {
    console.log(message);
    console.log("Message received: " + message.toString());

    let sensorData;

    try {
        sensorData = JSON.parse(message.toString()); //여기서 에러
        console.log("Parsed sensor data: ", sensorData);
        updateSectorInfo(database, sensorData);
    } catch (error) {
        console.error("Invalid message format: ", error);
        return;
    }
}

function connectionSuccess(client, mqtt_topic) {
    console.log("Connected to MQTT broker");

    // MQTT 토픽 구독
    client.subscribe(mqtt_topic, { qos: 1 }, function (err) {
        if (!err) {
            console.log(`Subscribed to topic: ${mqtt_topic}`);
        } else {
            console.log("Failed to subscribe: ", err.message);
        }
    });
}

function connectionError(err) {
    console.log("Connection failed: ", err.message);
}

function setupMQTT(database) {
    const mqtt_host = "54.180.187.212"; // 브로커 IP
    const mqtt_port = "8000"; // 브로커 포트
    const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100); // 클라이언트 ID

    // MQTT 클라이언트 생성
    const client = mqtt.connect(`ws://${mqtt_host}:${mqtt_port}`, {
        clientId: mqtt_clientId,
    });

    const mqtt_topic = "sensor/all"; // 나중에 변경
    client.on('connect', () => {connectionSuccess(client, mqtt_topic)});
    client.on('error', connectionError);
    client.on('message', (topic, msg) => {receivedMessage(msg, database, ref)});
}

setupMQTT(database, );

function getSensorData(database, ref, onValue)
{
    return new Promise((resolve, reject) => {
        const starCountRef = ref(database, 'sector/0/sensorData');
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            resolve(data);
        });
        // database.ref('sensorValue')
        //     .orderByChild('timestamp') // 타임스탬프 필드를 기준으로 정렬
        //     .startAt(startTime) // 주어진 startTime 이후의 데이터만 필터링
        //     .on('value', (snapshot) => { // 실시간으로 데이터 변경을 감지
        //         if (snapshot.exists())
        //         {
        //             const data = snapshot.val();
        //             const sensor = [];    // 데이터베이스에 접근해서 데이터를 담아둘 배열

        //             // 온도 데이터만 추출하여 배열에 저장
        //             for (let key in data)
        //             {
        //                 if (data[key].temperature)
        //                 {
        //                     sensor.push(data[key].temperature);
        //                 }
        //             }

        //             console.log(`Fetched sensor after ${startTime}: `, sensor);

        //             // 데이터를 성공적으로 가져왔으므로 resolve 호출
        //             resolve(sensor);
        //         }
        //         else
        //         {
        //             console.log("No data available after the specified time");
        //             resolve([]); // 데이터가 없으면 빈 배열을 반환
        //         }
        //     }, (error) => {
        //         console.error("Error fetching data: ", error);
        //         reject(error); // 에러 발생 시 Promise를 reject로 처리
        //     });
    });
}

// weekly_avg 데이터를 sector/sectorId에 저장하는 함수
function saveWeeklyAvgToFirebase(sector_id, weeklyData) {
    // 데이터베이스 경로 설정 (sector/{sector_id}/weekly_avg)
    const dataRef = ref(database, `sector/${sector_id}/weekly_avg`);
  
    // weekly_avg 데이터 저장
    set(dataRef, weeklyData)
      .then(() => {
        console.log('Firebase weekly_avg 저장 성공');
      })
      .catch((error) => {
        console.log('Firebase weekly_avg 저장 실패: ', error);
      });
}

// 데이터를 주단위로 묶어주는 함수
function groupByWeek(data) {
    const groupedData = [];
    let currentWeekStart = new Date(data[0].date);
    let currentWeekData = [];

    data.forEach((entry) => {
        const diff = (entry.date - currentWeekStart) / (1000 * 60 * 60 * 24); // 날짜 차이 계산 (일 단위)

        if (diff >= 7) {
            // 현재 주간 데이터 평균 계산
            groupedData.push({
                weekStart: currentWeekStart,
                avgTemperature: currentWeekData.reduce((sum, d) => sum + d.temperature, 0) / currentWeekData.length,
                avgSoilHumidity: currentWeekData.reduce((sum, d) => sum + d.soil_humidity, 0) / currentWeekData.length
            });

            // 새로운 주간 데이터 시작
            currentWeekStart = new Date(entry.date);
            currentWeekData = [];
        }

        currentWeekData.push(entry);
    });

    // 마지막 주간 데이터 처리
    if (currentWeekData.length > 0) {
        groupedData.push({
            weekStart: currentWeekStart,
            avgTemperature: currentWeekData.reduce((sum, d) => sum + d.temperature, 0) / currentWeekData.length,
            avgSoilHumidity: currentWeekData.reduce((sum, d) => sum + d.soil_humidity, 0) / currentWeekData.length
        });
    }

    return groupedData;  // forEach 루프가 끝난 후 데이터를 반환
}

// week단위로 센서데이터를 평균내어 저장하는 함수
function saveWeekData(sectorRef)
{
    // 섹터별 db의 값을 가져온다
    //const sectorRef = ref(database, `sector/${sector_id}/`);

    // Firebase에서 상태 값 읽어오기
    get(sectorRef)
    .then((snapshot) => {
        let currentData = snapshot.val();
        
        console.log(currentData);
        const sensorData = currentData.sensorData;

        // 날짜를 기준으로 데이터를 배열로 변환
        const entries = Object.entries(sensorData).map(([dateString, values]) => ({
            date: new Date(dateString),
            ...values
          }));

        // entry들을 주간별로 그룹핑한다
        const weeklyData = groupByWeek(entries);
        //console.log(weeklyData);

        // 주간평균을 DB에 저장한다
        saveWeeklyAvgToFirebase(sector_id, weeklyData);
    })
    .then(() => {
        console.log("Firebase 읽어오기 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}



module.exports = { setupMQTT, getSensorData };
