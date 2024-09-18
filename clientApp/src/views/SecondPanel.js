import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';

function SecondPanel(props) {  // kind 대신 일반 함수 컴포넌트로 변경
    const { back } = props;

    return (
        <Panel noBackButton noCloseButton {...props}>
            <Header title="Second Page" />
            <Button onClick={back}>Go Back</Button>
            {/* 여기에 SecondPanel의 추가 내용을 넣으세요 */}
        </Panel>
    );
};

export default SecondPanel;
