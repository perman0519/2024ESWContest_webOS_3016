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
import { Bell, Menu, Flower} from 'lucide-react'
import { SidebarPanel } from './SideBarPanel';
import css from '../App/App.module.less';


const wsRef = { current: null };  // 전역적으로 useRef와 비슷한 구조로 WebSocket 관리

function ConrtolOnOff({ user, type }) {
    const [isSelected, setIsSelected] = useState(false);
    const icon = type === "led" ? "💡" : "🚰";

    const sendMessage = useCallback((toggleStatus) => {
        if (wsRef.current) {
            const message = `
                {
                    "user_id": "${user.uid}",
                    "sector_id": ${0},
                    "type": "${type}",
                    "command": "${toggleStatus ? "ON" : "OFF"}"
                }
            `

            wsRef.current.send(message);
        }
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

  const generateGrowthData = () => {
    const baseData = [
      { date: '9월 1일', height: 5 },
      { date: '9월 5일', height: 7 },
      { date: '9월 10일', height: 12 },
      { date: '9월 15일', height: 18 },
      { date: '9월 20일', height: 25 },
      { date: '9월 25일', height: 30 },
    ];

    return baseData.map(item => ({
      ...item,
      height: item.height + (Math.random() - 0.5) * 5
    }));
  }

function SubscribePanel(props) {
    const { main, chart, user, login } = props;
    const [growthData, setGrowthData] = useState(generateGrowthData())
    const [currentTemp, setCurrentTemp] = useState(26)
    const [currentHumi, setCurrentHumi] = useState(40)
    const [currentSoilHumi, setCurrentSoilHumi] = useState(66)
    const [plantAge, setPlantAge] = useState(21)
    const [plantHeight, setPlantHeight] = useState(30)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [selectedPlant, setSelectedPlant] = useState("겨자")
    const [advisorMessage, setAdvisorMessage] = useState("식물이 건강하게 자라고 있습니다. 현재 생장 속도가 양호합니다.")
    const [src, setSrc] = useState('http://10.19.233.90:8081/stream');
    const [camerror, setError] = useState(false);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            await login();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, [login]);

    console.log('Main');
    console.log(user.uid);
    console.log(user.email);

    const handleSidebarToggle = useCallback((prevState) => {
        setIsSidebarOpen(!prevState);
    }, []);

    const handleSelectedPlant = useCallback((e) => {
        setSelectedPlant(e.value);
    }, []);

    const handleError = useCallback(() => {
        setError(true);
    }, []);

    useEffect(() => {
        const cameraInterval = setInterval(() => {
            setSrc("http://10.19.233.90:8081/stream");
            setError(false);
        }, 50000);

        const sensorInterval = setInterval(() => {
            let humi = Math.round(Math.random() * 30 + 50);
            let temp = Math.round(Math.random() * 10 + 20);
            let soilHumi = Math.round(Math.random() * 20 + 30);

            setCurrentHumi(humi);
            setCurrentSoilHumi(soilHumi);
            setCurrentTemp(temp);
        }, 10000);

        const plantHeightInterval = setInterval(() => {
            let age = plantAge + 1;
            let height = plantHeight + 1;

            setPlantAge(age);
            setPlantHeight(height);
            setGrowthData(generateGrowthData());
        }, 20000);

        return () => {clearInterval(sensorInterval); clearInterval(plantHeightInterval); clearInterval(cameraInterval);};

    }, [camerror, plantAge, plantHeight]);


    return (
        <Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
            {/* <Header title="COSMOS IoT Dashboard" /> */}
            <Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{height: '100%', width: '100%'}}>
                <Cell size="12%">
                    <SidebarPanel main={main} chart={chart} logout={logout} isSidebarOpen={isSidebarOpen}/>
                </Cell>
                <Cell className="flex-1 overflow-hidden">
                    <Column className="h-full overflow-y-auto p-2">
                        <Cell size={100} component="header" className="flex justify-between items-center mt-2 mb-6">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" className="lg:hidden text-gray-800" onClick={handleSidebarToggle}>
                                    <Menu className="h-6 w-6" />
                                </Button>
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Flower className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">안녕하세요, {user.email}</h1>
                                    <p className="text-l text-gray-600">오늘은 어떤 식물을 돌볼까요?</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">

                                <ConnectSocket />
                                <Button variant="outline" size="icon" className="text-gray-800 border-gray-300 hover:bg-green-100">
                                    <Bell size={20} />
                                </Button>
                                <Select className=""  onValueChange={handleSelectedPlant} defaultValue={selectedPlant}>
                                    <SelectItem value="겨자">겨자</SelectItem>
                                    <SelectItem value="바질">바질</SelectItem>
                                    <SelectItem value="로즈마리">로즈마리</SelectItem>
                                </Select>
                            </div>
                        </Cell>
                        <Cell className="grid grid-cols-12 gap-3">
                                <Card className="col-span-12 xl:col-span-8 bg-white border-gray-200">
                                <CardContent className="p-6">
                                    <div className='flex justify-evenly items-center mb-2'>
                                        <h2 className="text-xl font-semibold mb-4 text-gray-800">{selectedPlant} 식물 구역</h2>
                                        <div className="flex items-center space-x-4 border-x">
                                            <ConrtolOnOff user={user} type='waterpump' />
                                            <ConrtolOnOff user={user} type='led' />
                                        </div>
                                    </div>
                                    <div className=" rounded-lg flex items-center justify-center mb-4">
                                        <img
                                            src={src}
                                            width="940"
                                            height="600"
                                            onError={handleError} // 이미지 로드 실패 시 handleError 호출
                                            alt="Streaming Content"
                                        />
                                        {camerror && <span className="text-gray-500">실시간 식물 카메라</span>}
                                    </div>
                                    <div className="mt-8 flex justify-evenly items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {currentTemp}°C
                                            </div>
                                            <div>
                                            <p className="text-sm text-gray-500">현재 온도</p>
                                            <p className="text-lg font-semibold text-gray-800">실내 온도</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {currentHumi}%
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">현재 습도</p>
                                                <p className="text-lg font-semibold text-gray-800">실내 습도</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
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

            {/* 메인 콘텐츠 */}
        </Panel>
    );
}
function ConnectSocket() {
    const [isConnected, setIsConnected] = useState(false);  // 연결 성공 여부 상태 관리

    useEffect(() => {
        // WebSocket 연결을 설정하는 함수
        const connectWebSocket = () => {
            // eslint-disable-next-line no-undef
            wsRef.current = new WebSocket('ws://10.19.233.90:3001');

            wsRef.current.onopen = function() {
                console.log('Online 🟢');
                setIsConnected(true);  // 연결 성공 여부 업데이트
                // wsRef.current.send('안녕하세요, 서버!');
            };

            wsRef.current.onclose = function(event) {
                setIsConnected(false);  // 연결이 닫혔을 때 연결 상태 업데이트
                if (!event.wasClean) {
                    console.error('Offline 🔴');
                    // 5초 후에 다시 연결 시도
                    setTimeout(() => {
                        console.log('다시 연결 시도 중...');
                        connectWebSocket();  // 재연결 시도
                    }, 5000);  // 5초 후에 재연결 시도
                } else {
                    console.log('연결이 정상적으로 종료되었습니다.');
                }
            };

            wsRef.current.onmessage = function(event) {
                console.log('서버로부터 받은 메시지:', event.data);
            };

            wsRef.current.onerror = function(error) {
                console.error('WebSocket 오류 발생:', error);
            };
        };

        connectWebSocket();  // WebSocket 연결 시도

        return () => {
            if (wsRef.current) {
                wsRef.current.close();  // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
            }
        };
    }, []);  // 빈 배열을 넣어 첫 렌더링 시에만 실행되도록 설정

    return (
        <div>
            <span>{isConnected ? '🟢' : '🔴'}</span>
        </div>
    );
}

export default SubscribePanel;
