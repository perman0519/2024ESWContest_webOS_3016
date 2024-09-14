import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import './MainPanel.style.css';
// import MyCustomIconComponent from './MyCustomIconComponent';

const Login = (props) => {  // kind 대신 일반 함수 컴포넌트로 변경
    const navigate = useNavigate();

    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // const CustomButton = Button.extend({
    //     iconComponent: MyCustomIconComponent
    //   });

    return (
        <Panel {...props}>
            <Header title={<>Our42 Prized42<br />Subscribe to your own smart farm.</>} />
            <Button
            className="login-button"
            backgroundOpacity="transparent" //'transparent'
            size="large"
            // icon="googledrive"
            // color='green'
            onClick={goBack}
            >
                {/* <IconItem
                    image={ src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAoCAMAAABKKxPSAAAA4VBMVEX///9ChfTpQjU0qFP6uwUre/Pr8f4xffPP3fzpPzLoNCPw9P7nKRX6uAAUoUD75OPud3D97u380XdZkfUipEdDrV7q9OzT6dj1t7TxlI/sa2PufXbympX2wL7++fjzpqLqSDzoOSrrWlH3yMX50tDrVEr//vXqQxL62tj82pXuayzoNjf7wgDyjCH+8dr3qBP936b0qpIDcPODqvf7xk5rm/b6wjewzpnB0/uSs/jduCCwsjQQp1ePyZx9rURHpTyqxPqd0Kqx1Myu17c2oX1AiuEzqkA8k8Aql5V1voZmuXot1Mh3AAABe0lEQVQ4jc3Qa1uCMBQHcGQgMgZqbmjecKaWWVZ2s9LK6Kbf/wOFMC5jGPWmp/8LHnf8cQ47kvQ/Um7sV5rNVrtT/QZ1nR6ClOo6pRD1O7uYg6AuR9GhfJClqj0o89FRS2QDpMtCYF9kiT7hGzosp4ei6C9Eh0PvkcmkHmsBew1/IeU2pBnMYVdATryjChLY6HASsCPuW4S7jpXjLUQDcQ1cFOXkdCLTdg6bmh4802kOk849pyjmRVQo8jFYeS9w05AZM5XLJatfKb6L2hlqgcs1q9/kuNovHZvbzXPiPTQW/vv8vZjKbTS4xDL3oXaX2LN5D7CwWObm4dljDwuAl2lX88eqxfA8Nh8XAACrntWuUIgKoyfgh4el4Nrac1xaYQZXce1lFnTTku+SwAEMXHt7tl1ivQrtvLoFQmlhQryH94u8afGSWeoRTOT9Q9UM6SfwsyilYxOcZpjYAvPiYk5ivMpSviSWbzHGFtmpgoUs15vNeulmTvz7fAG/MyCzpVwuDgAAAABJRU5ErkJggg=="}
                    /> */}
                <img
                className="login-button"
                width="24"
                height="24"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAoCAMAAABKKxPSAAAA4VBMVEX///9ChfTpQjU0qFP6uwUre/Pr8f4xffPP3fzpPzLoNCPw9P7nKRX6uAAUoUD75OPud3D97u380XdZkfUipEdDrV7q9OzT6dj1t7TxlI/sa2PufXbympX2wL7++fjzpqLqSDzoOSrrWlH3yMX50tDrVEr//vXqQxL62tj82pXuayzoNjf7wgDyjCH+8dr3qBP936b0qpIDcPODqvf7xk5rm/b6wjewzpnB0/uSs/jduCCwsjQQp1ePyZx9rURHpTyqxPqd0Kqx1Myu17c2oX1AiuEzqkA8k8Aql5V1voZmuXot1Mh3AAABe0lEQVQ4jc3Qa1uCMBQHcGQgMgZqbmjecKaWWVZ2s9LK6Kbf/wOFMC5jGPWmp/8LHnf8cQ47kvQ/Um7sV5rNVrtT/QZ1nR6ClOo6pRD1O7uYg6AuR9GhfJClqj0o89FRS2QDpMtCYF9kiT7hGzosp4ei6C9Eh0PvkcmkHmsBew1/IeU2pBnMYVdATryjChLY6HASsCPuW4S7jpXjLUQDcQ1cFOXkdCLTdg6bmh4802kOk849pyjmRVQo8jFYeS9w05AZM5XLJatfKb6L2hlqgcs1q9/kuNovHZvbzXPiPTQW/vv8vZjKbTS4xDL3oXaX2LN5D7CwWObm4dljDwuAl2lX88eqxfA8Nh8XAACrntWuUIgKoyfgh4el4Nrac1xaYQZXce1lFnTTku+SwAEMXHt7tl1ivQrtvLoFQmlhQryH94u8afGSWeoRTOT9Q9UM6SfwsyilYxOcZpjYAvPiYk5ivMpSviSWbzHGFtmpgoUs15vNeulmTvz7fAG/MyCzpVwuDgAAAABJRU5ErkJggg=="
                alt="Google logo"
                />
                Login
            </Button>
            {/* 여기에 SecondPanel의 추가 내용을 넣으세요 */}
        </Panel>
    );
};

export default Login;
