import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@enact/sandstone/Panels';
import Switch from '@enact/sandstone/Switch';
import { Button } from '../components/button/Button';
import { Row, Cell, Column } from '@enact/ui/Layout';
import './MainPanel.style.css';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Card, CardContent } from '../components/card/Card';
import { Select, SelectItem } from '../components/select/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Bell, Menu, Flower } from 'lucide-react'
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
		sendMessage(e.selected);
	}, [sendMessage]);

	return (
		<div className='border-r'>
			<span>
				{icon} <Switch onToggle={handleToggle} />
			</span>
		</div>
	);
}

// const updateAdvisorMessage = (setAdvisorMessage) => {
//     const messages = [
//       "식물이 건강하게 자라고 있습니다. 현재 생장 속도가 양호합니다.",
//       "수분이 부족해 보입니다. 물을 주는 것이 좋겠습니다.",
//       "햇빛이 충분한지 확인해 주세요.",
//       "온도가 적정 범위를 벗어났습니다. 환경을 조절해 주세요.",
//       "영양분 공급이 필요해 보입니다. 비료를 주는 것을 고려해 보세요."
//     ]
//     const randomMessage = messages[Math.floor(Math.random() * messages.length)]
//     setAdvisorMessage(randomMessage)
//   }

const generateSensorData = () => {
	return Array.from({ length: 24 }, (_, i) => ({
		time: `${i}:00`,
		temperature: Math.random() * 10 + 20,
		humidity: Math.random() * 30 + 50,
		soilMoisture: Math.random() * 20 + 30,
	}))
}

function ChartPanel(props) {
	const { main, chart, user, login } = props;
	const [sensorData, setSensorData] = useState(generateSensorData())
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const [selectedPlant, setSelectedPlant] = useState("겨자")

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
	return (
		<Panel css={css} className='custom-panel' noBackButton noCloseButton {...props}>
			{/* <Header title="COSMOS IoT Dashboard" /> */}
			<Row className="flex h-screen bg-gradient-to-br from-green-100 to-green-200 text-gray-800 overflow-hidden" style={{ height: '100%', width: '100%' }}>
				<Cell size="12%">
					<SidebarPanel main={main} chart={chart} logout={logout} isSidebarOpen={isSidebarOpen} />
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
								<Select className="" onValueChange={handleSelectedPlant} defaultValue={selectedPlant}>
									<SelectItem value="겨자">겨자</SelectItem>
									<SelectItem value="바질">바질</SelectItem>
									<SelectItem value="로즈마리">로즈마리</SelectItem>
								</Select>
							</div>
						</Cell>
						<Cell className="grid grid-cols-12 gap-3">
							<Card className="col-span-12  bg-white border-gray-200">
								<CardContent className=" p-6">
									<h3 className="text-lg font-semibold mb-4 text-xl text-gray-800">센서 데이터</h3>
									<div className="mt-14 h-96">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={sensorData}>
												<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
												<XAxis dataKey="time" stroke="#6B7280" />
												<YAxis stroke="#6B7280" />
												<Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
												<Line type="monotone" dataKey="temperature" stroke="#EF4444" name="온도 (°C)" strokeWidth={2} dot={false} />
												<Line type="monotone" dataKey="humidity" stroke="#3B82F6" name="습도 (%)" strokeWidth={2} dot={false} />
												<Line type="monotone" dataKey="soilMoisture" stroke="#10B981" name="토양 습도 (%)" strokeWidth={2} dot={false} />
											</LineChart>
										</ResponsiveContainer>
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
	const [connectionAttempts, setConnectionAttempts] = useState(0);  // 연결 시도 횟수
	const [isConnected, setIsConnected] = useState(false);  // 연결 성공 여부 상태 관리

	useEffect(() => {
		// WebSocket 연결을 설정하는 함수
		const connectWebSocket = () => {
			// eslint-disable-next-line no-undef
			wsRef.current = new WebSocket('ws://10.19.233.90:3001');

			wsRef.current.onopen = function () {
				console.log('Online 🟢');
				setConnectionAttempts(0);  // 연결 성공 시 시도 횟수 초기화
				setIsConnected(true);  // 연결 성공 여부 업데이트
				// wsRef.current.send('안녕하세요, 서버!');
			};

			wsRef.current.onclose = function (event) {
				setIsConnected(false);  // 연결이 닫혔을 때 연결 상태 업데이트
				if (!event.wasClean) {
					console.error('Offline 🔴');
					setConnectionAttempts((prev) => prev + 1);  // 연결 시도 횟수 증가
					// 5초 후에 다시 연결 시도
					setTimeout(() => {
						console.log('다시 연결 시도 중...');
						connectWebSocket();  // 재연결 시도
					}, 5000);  // 5초 후에 재연결 시도
				} else {
					console.log('연결이 정상적으로 종료되었습니다.');
				}
			};

			wsRef.current.onmessage = function (event) {
				console.log('서버로부터 받은 메시지:', event.data);
			};

			wsRef.current.onerror = function (error) {
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

export default ChartPanel;
