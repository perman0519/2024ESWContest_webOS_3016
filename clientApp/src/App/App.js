import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import Panels from '@enact/sandstone/Panels';
import MainPanel from '../views/MainPanel';
import SecondPanel from '../views/SecondPanel';
import SocketPanel from '../views/SocketPanel';

import { useState, useCallback } from 'react';
import './attachErrorHandler';
import css from './App.module.less';

const App = (props) => {
    const [index, setIndex] = useState(0);

    const nextPanel = useCallback(() => {
        setIndex((prevIndex) => prevIndex + 1);
    }, []);

    const previousPanel = useCallback(() => {
        setIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }, []);

    const socketPanel = useCallback(() => {
        setIndex(2);
    }, []);

    const mainPanel = useCallback(() => {
        setIndex(0);
    }, []);

    return (
        <Panels {...props} index={index} onBack={previousPanel}>
            <MainPanel next={nextPanel} socket={socketPanel} />
            <SecondPanel back={previousPanel}/>
            <SocketPanel main={mainPanel}/>
        </Panels>
    );
};

const AppDecorator = kind({
    styles: {
        css,
        className: 'app'
    },
    render: (props) => <App {...props} />
});

export default ThemeDecorator(AppDecorator);
