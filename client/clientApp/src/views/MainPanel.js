import {useState, useEffect, useCallback} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import Switch from '@enact/sandstone/Switch';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import {signOut} from 'firebase/auth';
import { auth } from './firebase';
import { Card, CardContent } from '../components/card/Card';
import { Select, SelectItem } from '../components/select/Select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Menu, Flower } from 'lucide-react'
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';
import { usePlantContext } from './PlantContext.js';  // 추가
import { createToast } from '../components/toast';

const ip = "10.19.208.172:8081";

// const wsRef = { current: null };

// function waterpumpOn({ user }) {
function ControlOnOff({ user, type }) {
    const [isSelected, setIsSelected] = useState(false);
    const icon = type === "led" ? "💡" : "🚰";

    const sendMessage = useCallback((toggleStatus) => {
        fetch(`http://${ip}/api/arduino`, {
            method: 'POST', // POST 요청
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 보낼 때
            },
            body: JSON.stringify({
                "user_id": `${user.uid}`,
                "sector_id": `${0}`,
                "type": `${type}`,
                "command": `${toggleStatus ? "ON" : "OFF"}`
            })
        }).then(response => response.json())
        .then(data => {
            createToast(data);
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }, [user, type]);

    const handleToggle = useCallback((e) => {
        setIsSelected(e.selected);
        sendMessage(isSelected);
    }, [isSelected, sendMessage]);

    return (
        <div className='border-r'>
            <span>
                {icon} <Switch onToggle={handleToggle} />
            </span>
        </div>
    );
}

//   const generateGrowthData = () => {
//     const baseData = [
//       { date: '9월 1일', height: 5 },
//       { date: '9월 5일', height: 7 },
//       { date: '9월 10일', height: 12 },
//       { date: '9월 15일', height: 18 },
//       { date: '9월 20일', height: 25 },
//       { date: '9월 25일', height: 30 },
//     ];

//     return baseData.map(item => ({
//       ...item,
//       height: item.height + (Math.random() - 0.5) * 5
//     }));
//   }

async function setPlantList(user) {
    const getSubListRes = await fetch(`http://${ip}/api/sub-list/${user.uid}`);
    console.log(getSubListRes);
    const res = await getSubListRes.json();
    console.log(res);
    return res;
}

async function initSelectedPlant(selectSectorId, selectedPlantList) {
    if (!selectedPlantList || selectedPlantList.length === 0) {
        return null;
    }
    const id = selectSectorId === "" ? selectedPlantList[0].id : selectSectorId;
    const selectRes = await fetch(`http://${ip}/api/sector/${id}`);
    if (!selectRes.ok) {
        throw new Error('Failed to fetch plant details');
    }
    const select = await selectRes.json();
    return select;
}

async function getSensorLatest(selectSectorId) {
    const res = await fetch(`http://${ip}/api/sensor/latest/${selectSectorId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch sensor data');
    }
    const data = await res.json();
    return data;
}

function calculateDateDifference(endDate) {
    try {
      const start = new Date();
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new Error("Invalid end date format. Please enter a valid date.");
      }
      if (start < end) {
        throw new Error("End date should be later than or equal to today's date.");
      }
      const diffInTime = start.getTime() - end.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

      return diffInDays;
    } catch (error) {
      return error.message;
    }
  }

function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

let sensorInterval;
function MainPanel(props) {
    const { main, chart, user, subscribe, login, timelapse } = props;
    const {
        selectedPlantList,
        setSelectedPlantList,
        selectedPlant,
        setSelectedPlant,
        selectSectorId,
		setSelectSectorId,
		plantAge,
		setPlantAge,
		plantHeight,
		setPlantHeight
    } = usePlantContext();  // Context에서 상태 가져오기

    const [growthData, setGrowthData] = useState([]);
    const [currentTemp, setCurrentTemp] = useState(0);
    const [currentHumi, setCurrentHumi] = useState(0);
    const [currentSoilHumi, setCurrentSoilHumi] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [src, setSrc] = useState(`http://${ip}/stream`);
    const [camerror, setCameraError] = useState(false);
    const [advisorMessage, setAdvisorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [firebseError, setFirebseError] = useState(null);
    const [showButton, setShowButton] = useState(false); // 버튼을 보여줄지 결정하는 상태

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setFirebseError(null);
            try {
                const plantList = await setPlantList(user);
                if (!plantList.length) {
                    subscribe();
                }
                setSelectedPlantList(plantList);
                const id = selectSectorId === "" ? plantList[0].id : selectSectorId;
                setSelectSectorId(id);
                if (plantList.length > 0) {
                    const plant = await initSelectedPlant(selectSectorId, plantList);
                    setSelectedPlant(plant);
                    setPlantAge(calculateDateDifference(plant.plant.createdAt));
                    const maxAge = plant.plant.name === "bazil" ? 30 : 60;
                    if (plantAge > maxAge) {
                        setShowButton(true);
                    }
                    else {
                        setShowButton(false);
                    }
                    setPlantHeight(plant.plant.length[formatDateToYYYYMMDD(new Date())]);
                    setAdvisorMessage(plant.plant.prompt);
                    const baseData = Object.entries(plant.plant.length).map(([date, height]) => ({
                        date,
                        height
                      }));
                    setGrowthData(baseData);
                } else {
                    setFirebseError("No plants found for this user");
                }
                const sensorData = await getSensorLatest(plantList[0].id);
                setCurrentHumi(sensorData.humidity);
                setCurrentSoilHumi(sensorData.soil_humidity);
                setCurrentTemp(sensorData.temperature);

                sensorInterval = setInterval(async() => {
                    const sensorLastestData = await getSensorLatest(plantList[0].id);
                    setCurrentHumi(sensorLastestData.humidity);
                    setCurrentSoilHumi(sensorLastestData.soil_humidity);
                    setCurrentTemp(sensorLastestData.temperature);
                }, 10000);

                return () => clearInterval(sensorInterval);
            } catch (err) {
                console.error("Error fetching data:", err);
                setFirebseError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        if (user && user.uid) {
            fetchData();
        }
    // }, [user, setSelectedPlantList, setSelectSectorId, setPlantAge, setPlantHeight, subscribe, selectedPlant, setSelectedPlant, plantAge, plantHeight]);
 // eslint-disable-next-line
    }, [user, setSelectedPlantList, plantAge]);

    const waterpumpOn = useCallback(() => {
        console.log('워터펌프를 켭니다.');
        fetch(`http://${ip}/api/arduino`, {
            method: 'POST', // POST 요청
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 보낼 때
            },
            body: JSON.stringify({
                "user_id": `${user.uid}`,
                "sector_id": `${0}`,
                "type": 'waterpump',
                "command": `ON`
            })
        }).then(response => response.json())
        .then(data => {
            createToast(data);
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }, [user]);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            await login();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, [login]);

    const handleSidebarToggle = useCallback((prevState) => {
        setIsSidebarOpen(!prevState);
    }, []);

    const handleSelectedPlant = useCallback(async (value) => {
        console.log(value);
        const vlist = value.split('-');
        setSelectSectorId(vlist[0]);
        fetch(`http://${ip}/api/sector/${vlist[0]}`).then((res) => {
            if (!res.ok) {
                throw new Error('Failed to fetch plant details');
            }
            res.json().then((data) => {
                setSelectedPlant(data);
                setPlantAge(calculateDateDifference(data.plant.createdAt));
                console.log(data.plant.length);
                setPlantHeight(data.plant.length[formatDateToYYYYMMDD(new Date())]);
                const baseData = Object.entries(data.plant.length).map(([date, height]) => ({
                    date,
                    height
                  }));
                setGrowthData(baseData);
            });
        });

        clearInterval(sensorInterval);
        const sensorData = await getSensorLatest(vlist[0]);
        setCurrentHumi(sensorData.humidity);
        setCurrentSoilHumi(sensorData.soil_humidity);
        setCurrentTemp(sensorData.temperature);
        sensorInterval = setInterval(async() => {
            const sensorLatestData = await getSensorLatest(vlist[0]);
            setCurrentHumi(sensorLatestData.humidity);
            setCurrentSoilHumi(sensorLatestData.soil_humidity);
            setCurrentTemp(sensorLatestData.temperature);
        }, 10000);
        // eslint-disable-next-line
    }, []);

    const handleError = useCallback(() => {
        setCameraError(true);
    }, []);

    const handleHarvest = useCallback(() => {
        // 일단 학습 api 호출
        // firebase 데이터 삭제
        // timelapse
    }, []);

    useEffect(() => {
        const cameraInterval = setInterval(() => {
            setSrc(`http://${ip}/stream?${new Date().getTime()}`);
            setCameraError(false);
        }, 10000);

        return () => {clearInterval(cameraInterval);};

    }, [user.uid, camerror, plantAge, plantHeight]);

    if (isLoading) {
        return <div>데이터를 불러오는 중입니다...</div>;
    }

    if (firebseError) {
        return <div>오류가 발생했습니다: {firebseError}</div>;
    }

    if (!selectedPlant) {
        return <div>선택된 식물이 없습니다.</div>;
    }

    return (
        <Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
            {/* <Header title="COSMOS IoT Dashboard" /> */}
            <Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{height: '100%', width: '100%'}}>
                <Cell size="12%">
                    <SidebarPanel main={main} chart={chart} logout={logout} subscribe={subscribe} timelapse={timelapse} isSidebarOpen={isSidebarOpen}/>
                </Cell>
                <Cell className="flex-1 overflow-hidden">
                    <Column className="h-full overflow-y-auto p-2">
                        <Cell size={100} component="header" className="flex justify-between items-center mt-2 mb-6">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" className="lg:hidden text-gray-800" onClick={handleSidebarToggle}>
                                    <Menu className="h-6 w-6" />
                                </Button>
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Flower className="text-white" size={40} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">안녕하세요, {user.email}</h1>
                                    <p className="text-l text-gray-600">오늘은 어떤 식물을 돌볼까요?</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Select className=""  onValueChange={handleSelectedPlant} defaultValue={selectedPlant.plant.name}>
                                    {selectedPlantList.map((plant) => <SelectItem value={plant.id+"-"+plant.name}>{plant.name}</SelectItem>)}
                                </Select>
                            </div>
                        </Cell>
                        <Cell className="grid grid-cols-12 gap-3">
                                <Card className="col-span-12 xl:col-span-8 bg-white border-gray-200">
                                <CardContent className="p-6">
                                    <div className='flex justify-evenly items-center mb-2'>
                                        <h2 className="text-xl font-semibold mb-4 text-gray-800">{selectedPlant? selectedPlant.plant.name: ""} 식물 구역</h2>
                                        <div className="flex items-center space-x-4 border-x">
                                            <Button onClick={waterpumpOn}>🚰 On</Button>
                                            <ControlOnOff user={user} type='led' />
                                        </div>
                                        {
                                            showButton &&
                                            <Button variant="outline" onClick={handleHarvest} className="text-gray-800 w-fit text-sm border-gray-300 hover:bg-green-100">
                                                <span>수확하기</span>
                                            </Button>
                                        }
                                    </div>
                                    <div className=" rounded-lg flex items-center justify-center mb-4">
                                        { !camerror &&
                                            <img
                                                src={src}
                                                width="940"
                                                height="600"
                                                onError={handleError}
                                                alt="Streaming Content"
                                            />
                                        }
                                        {camerror && <span className="text-gray-500">실시간 식물 카메라</span>}
                                    </div>
                                    <div className="mt-8 flex justify-evenly items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-20 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {currentTemp}°C
                                            </div>
                                            <div>
                                            <p className="text-sm text-gray-500">현재 온도</p>
                                            <p className="text-lg font-semibold text-gray-800">실내 온도</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-20 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {currentHumi}%
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">현재 습도</p>
                                                <p className="text-lg font-semibold text-gray-800">실내 습도</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-20 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {currentSoilHumi}°C
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">현재 토양 습도</p>
                                                <p className="text-lg font-semibold text-gray-800">토양습도</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-8 xl:col-span-4 bg-white border-gray-200">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">식물 성장</h3>
                                    <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">식물 나이</p>
                                        <p className="text-2xl font-bold text-gray-800">{plantAge} 일</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">현재 높이</p>
                                        <p className="text-2xl font-bold text-gray-800">{plantHeight} cm</p>
                                    </div>
                                    </div>
                                    <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            domain={[0, 'dataMax + 5']}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                                            labelStyle={{ color: '#111827' }}
                                            itemStyle={{ color: '#10B981' }}
                                        />
                                        <defs>
                                            <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="height"
                                            stroke="#10B981"
                                            fill="url(#colorHeight)"
                                            strokeWidth={2}
                                            dot={{ fill: '#10B981', strokeWidth: 2 }}
                                        />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                    <h4 className="text-md font-semibold mb-2 text-green-800">식물 어드바이저</h4>
                                    <p className="text-sm text-green-700">{advisorMessage}</p>
                                    </div>
                                </CardContent>
                             </Card>
                        </Cell>
                    </Column>
                </Cell>
            </Row>
        </Panel>
    );
}

// function ConnectSocket() {
//     const [isConnected, setIsConnected] = useState(false);

//     useEffect(() => {
//         const connectWebSocket = () => {
//             // eslint-disable-next-line no-undef
//             wsRef.current = new WebSocket('ws://10.19.208.172:3001');

//             wsRef.current.onopen = function() {
//                 console.log('Online 🟢');
//                 setIsConnected(true);
//             };

//             wsRef.current.onclose = function(event) {
//                 setIsConnected(false);
//                 if (!event.wasClean) {
//                     console.error('Offline 🔴');
//                     setTimeout(() => {
//                         console.log('다시 연결 시도 중...');
//                         connectWebSocket();
//                     }, 5000);
//                 } else {
//                     console.log('연결이 정상적으로 종료되었습니다.');
//                 }
//             };

//             wsRef.current.onmessage = function(event) {
//                 console.log('서버로부터 받은 메시지:', event.data);
//             };

//             wsRef.current.onerror = function(error) {
//                 console.error('WebSocket 오류 발생:', error);
//             };
//         };

//         connectWebSocket();

//         return () => {
//             if (wsRef.current) {
//                 wsRef.current.close();
//             }
//         };
//     }, []);

//     return (
//         <div>
//             <span>{isConnected ? '🟢' : '🔴'}</span>
//         </div>
//     );
// }

export default MainPanel;
