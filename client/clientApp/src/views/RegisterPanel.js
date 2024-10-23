import { Panel, Header } from '@enact/sandstone/Panels'
// import { useNavigate } from 'react-router-dom';
import Button from '@enact/sandstone/Button';
import {InputField} from '@enact/sandstone/Input';
import { useState, useCallback } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signOut  } from 'firebase/auth';
import { createToast } from '../components/toast';
// function validateEmail(email) {
//     const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return re.test(String(email).toLowerCase());
// }

function RegisterPanel(props) {
	const { login } = props;
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordCheck, setPasswordCheck] = useState('');

	const handleEmailChange = useCallback((event) => {
        setEmail(event.value);
      }, []);

	const handlePasswordChange = useCallback((event) => {
		setPassword(event.value);
	}, []);

	const handlePasswordCheckChange = useCallback((event) => {
		setPasswordCheck(event.value);
	}, []);

	const handleRegister = useCallback(async () => {
		// if (validateEmail(email) === false) {
		// 	createToast("비밀번호 6자리 이상 입력해주세요.");
		// }
		if (password.length < 6) {
			createToast("비밀번호 6자리 이상 입력해주세요.");
		} else if (password === passwordCheck) {
			try {
				await createUserWithEmailAndPassword(auth, email, password);
				console.log('Resigter successful');
			//   localStorage.setItem('user', user);
				await signOut(auth);
				createToast("회원가입 성공!");
				login();
			} catch (error) {
				console.log(error.message);
				createToast(error.message);
			}
		} else {
			createToast("비밀번호가 다릅니다. 확인해 주세요");
		}

      }, [email, password, login, passwordCheck]);

    return (
        <Panel noBackButton noCloseButton {...props}>
            <Header title="Register" />
            <div>
              <InputField
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                />
              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <InputField
                type="password"
                placeholder="Password Check"
                value={passwordCheck}
                onChange={handlePasswordCheckChange}
              />
			  <Button onClick={handleRegister}>Register</Button>
            </div>
        </Panel>
    );
}

export default RegisterPanel;
