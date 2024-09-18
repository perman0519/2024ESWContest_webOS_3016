import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import { useEffect, useState } from 'react';

const wsRef = { current: null };  // 전역적으로 useRef와 비슷한 구조로 WebSocket 관리

function SocketPanel(props) {  // kind 대신 일반 함수 컴포넌트로 변경
    const { main } = props;

    console.log("외부함수에서 socket접근 Test: ",wsRef);

    return (
        <Panel noBackButton noCloseButton {...props}>
            <Header title="Socket Page" />
            <Button onClick={main}>Go Home</Button>
            <ConnectSocket />
            {/* 여기에 SocketPanel의 추가 내용을 넣으세요 */}
        </Panel>
    );
};


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

export default SocketPanel;
