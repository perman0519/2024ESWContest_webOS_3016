import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPanel from '../views/MainPanel';
import SecondPanel from '../views/SecondPanel';
import Login from '../views/Login';

const App = kind({
    name: 'App',
    render: () => (
        <Router>
            <Routes>
                <Route path="/" element={<MainPanel />} />
                <Route path="/second" element={<SecondPanel />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    )
});

export default ThemeDecorator(App);
