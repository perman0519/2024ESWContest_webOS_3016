import { useEffect } from 'react';
import { Panel } from '@enact/sandstone/Panels'
import {InputField} from '@enact/sandstone/Input';
import { useState, useCallback } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Flower } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/card/Card';
import { Button } from '../components/button/Button';
import { Label } from '../components/label/Label';
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

    useEffect(() => {
      if (user && user.uid) {
        main();
      }
    }, []);

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
            <div>
                {user ? (
                    <div>
                        <p>Welcome, {user.email}</p>
                        <p>UID: {user.uid}</p>

                        <Button onClick={main}>Go Main</Button>
                        <Button onClick={logout}>Logout</Button>
                    </div>
                ) : (
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                  <Card className="bg-white shadow-md rounded-lg w-full max-w-md">
                    <CardHeader>
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Flower className="text-white" size={24} />
                        </div>
                      </div>
                      <CardTitle>식물 대시보드 로그인</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>

                            <InputField
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                        />

                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <InputField
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        />
                          </div>
                        </div>
                        <Button onClick={handleLogin} className="w-full mt-6">
                          로그인
                        </Button>
                    </CardContent>
                    <CardFooter>
                      <Button
                      onClick={register}
                        variant="default"
                        className="w-full py-3 text-lg font-semibold bg-green-500 hover:bg-green-600"
                      >
                        회원가입
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                )}
            </div>
        </Panel>
    );
}

export default LoginPanel;
