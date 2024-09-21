import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Switch from '@enact/sandstone/Switch';
import Button from '@enact/sandstone/Button';
import './MainPanel.style.css';
import {signOut} from 'firebase/auth';
import { auth } from './firebase';

import ChartComponent from './chartComponent.js';


const wsRef = { current: null };  // 전역적으로 useRef와 비슷한 구조로 WebSocket 관리

function ConrtolOnOff({user, type}) {
    const [isSelected, setIsSelected] = useState(false);

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
        <div>
            <span>
                <Switch onToggle={handleToggle} />
            </span>
            <span>
                {isSelected ? <span>{type} on</span> : <span>{type} off</span>}
            </span>
        </div>
    );
}

function MainPanel(props) {
    const { next, user, login, chart } = props;

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

    return (
        <Panel noBackButton noCloseButton {...props}>
            <Header title="COSMOS IoT Dashboard" />
            <div>
                {user ? (
                    <div>
                        <p>환영합니다, {user.email}님.</p>
                        <p>UID: {user.uid}</p>
                        <Button onClick={logout}>Logout</Button>
                    </div>
                ) : (
                    <Button onClick={login}>Login Page</Button>
                )}
            </div>
            <div className="main-container">
				<div className="temp-box box-three">
                    {/* console.log("test"); */}
                    <div>
                       <img src="http://192.168.100.103:8081/stream" alt='img' width="600"/>
                    </div>
                </div>
                <ConnectSocket />
                <Button onClick={next}>Next Page</Button>
                <Button onClick={chart}>Chart test</Button>
                <ChartComponent />

                {/* <Button onClick={socket}>Socket Page</Button> */}
                <div className="temp-box box-four">
                    <div>
                        <ConrtolOnOff user={user} type='led'/>
                    </div>
                    <div>
                        <ConrtolOnOff user={user} type='waterpump' />
                    </div>
                </div>
            </div>
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
            wsRef.current = new WebSocket('ws://10.19.208.172:3001');

            wsRef.current.onopen = function() {
                console.log('Online 🟢');
                setConnectionAttempts(0);  // 연결 성공 시 시도 횟수 초기화
                setIsConnected(true);  // 연결 성공 여부 업데이트
                // wsRef.current.send('안녕하세요, 서버!');
            };

            wsRef.current.onclose = function(event) {
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
            <span>WebSocket 연결 시도 횟수: {connectionAttempts}</span>
            <span>WebSocket 상태: {isConnected ? '🟢' : '🔴'}</span>
        </div>
    );
}

export default MainPanel;
