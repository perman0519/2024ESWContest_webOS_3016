import { Panel, Header } from '@enact/sandstone/Panels'
// import { useNavigate } from 'react-router-dom';
import Button from '@enact/sandstone/Button';
import {InputField} from '@enact/sandstone/Input';
import { useState, useCallback } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// import { getDatabase, ref, onValue } from "firebase/database";
// import { getAuth } from "firebase/auth";

// const db = getDatabase();
// const auth = getAuth();

// const userId = auth.currentUser.uid;
// return onValue(ref(db, '/users/' + userId), (snapshot) => {
//   const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
//   // ...
// }, {
//   onlyOnce: true
// });

function LoginPanel(props) {
    const { main, user, setUser, register } = props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //         setUser(currentUser);
    //     });
    //     return () => unsubscribe();
    // }, []);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    const handleEmailChange = useCallback((event) => {
        setEmail(event.value);
      }, []);

      const handlePasswordChange = useCallback((event) => {
        setPassword(event.value);
      }, []);

      const handleLogin = useCallback(async () => {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          console.log('Login successful');
        //   localStorage.setItem('user', user);
          setUser(auth.currentUser);
          main();
        } catch (error) {
          console.error('Login error:', error.message);
          // 에러 처리 (예: 에러 메시지 표시)
        }
      }, [email, password, main, setUser]);


    // const getData = useCallback(() => {
    //     const db = getDatabase();
    //     const userId = auth.currentUser.uid;
    //     return onValue(ref(db, '/' + userId), (snapshot) => {
    //         const sector = (snapshot.val() && snapshot.val().sector) || 'Anonymous';
    //         console.log("Sector: ", sector[0]);
    //     }, {
    //         onlyOnce: true
    //     });
    // }, []);

    return (
        <Panel noBackButton noCloseButton {...props}>
            <Header title="Login Page" />
            <div>
                {user ? (
                    <div>
                        <p>Welcome, {user.email}</p>
                        <p>UID: {user.uid}</p>
                        <Button onClick={main}>Go Main</Button>
                        <Button onClick={logout}>Logout</Button>
                    </div>
                ) : (
                    <div>
                        <p>Please log in</p>
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
                        <Button onClick={handleLogin}>Login</Button>
                    </div>
                )}
            </div>
            <div>
              <Button onClick={register}>Register</Button>
            </div>
        </Panel>
    );
}

export default LoginPanel;
