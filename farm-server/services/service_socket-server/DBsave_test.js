// const WebSocket = require("ws");
// const mqtt = require('mqtt');
// const { database } = require('./firebase.js');
const { ref, set, get } = require('firebase/database');

const initializeApp = require('firebase/app').initializeApp;
const getDatabase = require('firebase/database').getDatabase;
require('dotenv').config({ path: './.env' });

// firebase init
const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// weekly_avg 데이터를 sector/0에 저장하는 함수
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
function setWeekData(sector_id)
{
    // 섹터별 db의 값을 가져온다
    const sectorRef = ref(database, `sector/${sector_id}/`);

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

setWeekData(0);

// storePumpStatus and add Pump_count
function storePumpStatus(sector_id, state) {
    const commandRef = ref(database, `sector/${sector_id}/Pump_Status/`);

    // Firebase에서 상태 값 읽어오기
    get(commandRef)
    .then((snapshot) => {
        let currentData = snapshot.val();

        let setData = {
            status: state,
            count: currentData && currentData.count ? currentData.count : 0
        };
        if (state === "ON"){
            setData.count += 1;
        }
        // 상태데이터 설정
        return set(commandRef, setData);
    })
    .then(() => {
        console.log("Firebase 저장 성공");
    })
    .catch((error) => {
        console.log("Firebase 저장 실패: ", error);
    });
}
