import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Switch from '@enact/sandstone/Switch';
import Button from '@enact/sandstone/Button';
import * as Paho from 'paho-mqtt';
import './MainPanel.style.css';
import {signOut} from 'firebase/auth';
import { auth } from './firebase';


const wsRef = { current: null };  // 전역적으로 useRef와 비슷한 구조로 WebSocket 관리

// MQTT 클라이언트 설정
const mqtt_host = "192.168.100.102";
const mqtt_port = 8000;
const mqtt_clientId = "clientID-" + parseInt(Math.random() * 100);

// MQTT 클라이언트를 관리하는 커스텀 훅
function useMQTTClient() {
    const [client, setClient] = useState(null);

    useEffect(() => {
        const mqttClient = new Paho.Client(mqtt_host, mqtt_port, mqtt_clientId);

        const onConnect = () => {
            console.log("Connected to MQTT broker");
            setClient(mqttClient);
        };

        const onFailure = (error) => {
            console.log("Connection failed: " + error.errorMessage);
        };

        mqttClient.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            useSSL: false  // 필요한 경우 SSL 사용
        });

        return () => {
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
        };
    }, []);

    return client;
}

function TextOnOff({topic, client, name}) {
    const [isSelected, setIsSelected] = useState(false);

    const sendMessage = useCallback((toggleStatus) => {
        if (client && client.isConnected()) {
            const message = new Paho.Message(toggleStatus ? "ON" : "OFF");
            message.destinationName = topic;
            client.send(message);
            console.log(`Message sent to ${topic}: ${message.payloadString}`);
        }
    }, [client, topic]);

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
                {isSelected ? <span>{name} on</span> : <span>{name} off</span>}
            </span>
        </div>
    );
}

function MainPanel(props) {
    const client = useMQTTClient();

    const { next, user, login } = props;

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
                {/* <Button onClick={socket}>Socket Page</Button> */}
                <div className="temp-box box-four">
                    <div>
                        <TextOnOff topic="esp32/led/command" client={client} name='led' />
                    </div>
                    <div>
                        <TextOnOff topic="esp32/waterpump/command" client={client} name='waterpump'/>
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
                console.log('서버에 연결되었습니다.');
                setConnectionAttempts(0);  // 연결 성공 시 시도 횟수 초기화
                setIsConnected(true);  // 연결 성공 여부 업데이트
                wsRef.current.send('안녕하세요, 서버!');
            };

            wsRef.current.onclose = function(event) {
                setIsConnected(false);  // 연결이 닫혔을 때 연결 상태 업데이트
                if (!event.wasClean) {
                    console.error('연결이 비정상적으로 종료되었습니다. 재시도 중...');
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
            <span>WebSocket 상태: {isConnected ? '연결됨' : '연결되지 않음'}</span>
        </div>
    );
}

export default MainPanel;
