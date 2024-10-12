const database = require('./firebase.js');
const { ref, set, get } = require('firebase/database');

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

//setWeekData(0);

// ISO 8601형식의 문자열을 열월일시분초 형식으로 변환
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 주간 펌프횟수를 저장
function saveWeeklyPumpData(sector_id, count) {
    let id = 0;  // 시작 ID를 0으로 설정
    const checkAndStore = () => {
        const dataRef = ref(database, `sector/${sector_id}/weekly_avg/${id}`);
        
        // Firebase에서 해당 경로의 데이터를 읽어옴
        get(dataRef).then((snapshot) => {
            let currentData = snapshot.val();
            
            // pumpCnt가 없는 경우에만 값을 설정
            if (!currentData || !currentData.pumpCnt) {
                let setData = {
                    ...currentData,  // 기존 데이터 유지
                    pumpCnt: count   // 새로 추가할 pumpCnt 값
                };

                // Firebase에 데이터 저장
                return set(dataRef, setData)
                    .then(() => {
                        console.log(`ID ${id}에 pumpCnt 저장 성공`);
                    })
                    .catch((error) => {
                        console.error(`ID ${id}에 데이터 저장 실패: `, error);
                    });
            } else {
                // pumpCnt가 있는 경우, 다음 ID로 이동하여 다시 체크
                id++;
                checkAndStore();
            }
        }).catch((error) => {
            console.error(`Firebase 읽기 실패: `, error);
        });
    };
    // 최초 호출
    checkAndStore();
}

// storePumpStatus and add Pump_count
function storePumpStatus(sector_id, state) {
    const commandRef = ref(database, `sector/${sector_id}/Pump_Status/`);
    const currentTime = new Date();  // 현재 시간을 Date 객체로 가져옴

    // Firebase에서 상태 값 읽어오기
    get(commandRef)
    .then((snapshot) => {
        let currentData = snapshot.val();
        
        // startTime이 연월일시분초 형식으로 저장되어 있는 경우 처리
        let startTime = currentData && currentData.start ? new Date(currentData.start) : currentTime;

        // 1주일(7일) 차이가 나는지 계산 (Date 객체끼리 비교)
        const timeDifference = (currentTime - startTime) / (1000 * 60 * 60 * 24); // 일 단위 계산

        let setData = {
            status: state,
            count: currentData && currentData.count ? currentData.count : 0,
            start: formatDate(startTime) // 저장할 때는 연월일시분초 형식으로 변환
        };

        // 1주일 이상 차이가 나면 count를 0으로 초기화하고 start를 현재 시간으로 설정
        if (timeDifference >= 7) {
            saveWeeklyPumpData(sector_id, currentData.count);
            setData.count = 0;
            setData.start = formatDate(currentTime); // 새로운 시작 시간을 현재 시간으로 설정
        }

        if (state === "ON") {
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

// 함수 호출 예시
storePumpStatus(0, "ON");