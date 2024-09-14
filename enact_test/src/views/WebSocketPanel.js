import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { BodyText } from '@enact/sandstone/BodyText';

import { useEffect, useState } from 'react';

const wsRef = { current: null };  // 전역적으로 useRef와 비슷한 구조로 WebSocket 관리

function ConnectSocket() {
    const [connectionAttempts, setConnectionAttempts] = useState(0);  // 연결 시도 횟수
    const [isConnected, setIsConnected] = useState(false);  // 연결 성공 여부 상태 관리

    useEffect(() => {
        // WebSocket 연결을 설정하는 함수
        const connectWebSocket = () => {
            // eslint-disable-next-line no-undef
            wsRef.current = new WebSocket('ws://localhost:3001');

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



// function ConnectSocket() {
//     // eslint-disable-next-line no-undef
//     const ws = new WebSocket('ws://localhost:3001');

//     const [connectionAttempts, setConnectionAttempts] = useState(0);  // 연결 시도 횟수

//     console.log("run ConnectSocket function");
//     console.log("ws state: ", ws.readyState);

//     ws.onopen = function() {
//         console.log('서버에 연결되었습니다.');
//         console.log('연결시도횟수: ', connectionAttempts);
//         setConnectionAttempts(0);//연결시도횟수 0으로 초기화
//         ws.send('안녕하세요, 서버!');
//     };

//     ws.onclose = function(event) {
//         if (!event.wasClean) {
//             console.error('연결이 비정상적으로 종료되었습니다. 재시도 중...');
//             setConnectionAttempts((prev) => prev + 1);  // 연결 시도 횟수 증가
//             // 5초 후에 다시 연결 시도
//             setTimeout(() => {
//                 console.log('다시 연결 시도 중...');
//                 ConnectSocket();  // 재연결 시도
//             }, 5000);  // 5초 후에 재연결 시도
//         } else {
//             console.log('연결이 정상적으로 종료되었습니다.');
//         }
//     }

//     ws.onmessage = function(event) {
//         console.log('서버로부터 받은 메시지:', event.data);
//     };

//     return (
//         <div>
//             <span>
//                 <span>websocket server state :</span>
//                 <span id="ws-state" />
//             </span>
//         </div>
//     );
// }

const WebSocketPanel = (props) => {  // kind 대신 일반 함수 컴포넌트로 변경
    const navigate = useNavigate();

    const goBack = useCallback(() => {
		navigate(-1);
    }, [navigate]);

    console.log("외부함수에서 socket접근 Test: ",wsRef);

    return (
        <Panel {...props}>
            <Header title="WebSocket Page" />
            <Button onClick={goBack}>Go Back</Button>
            {/* 여기에 WebSocketPanel의 추가 내용을 넣으세요 */}
            <div>
                <ConnectSocket />
                <BodyText>qwer</BodyText>
            </div>
        </Panel>
    );
};

export default WebSocketPanel;
