import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const SecondPanel = (props) => {  // kind 대신 일반 함수 컴포넌트로 변경
    const navigate = useNavigate();

    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);



    return (
        <Panel {...props}>
            <Header title="Second Page" />
            <Button onClick={goBack}>Go Back</Button>
            {/* 여기에 SecondPanel의 추가 내용을 넣으세요 */}
        </Panel>
    );
};

export default SecondPanel;
