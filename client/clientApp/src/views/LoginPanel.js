import { Panel } from '@enact/sandstone/Panels'
import {InputField} from '@enact/sandstone/Input';
import { useState, useCallback } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Flower } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/card/Card';
import { Button } from '../components/button/Button';
import { Label } from '../components/label/Label';

function LoginPanel(props) {
    const { main, user, setUser, register } = props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
          setUser(auth.currentUser);
          main();
        } catch (error) {
          console.error('Login error:', error.message);
        }
      }, [email, password, main, setUser]);
    return (
      <Panel noBackButton noCloseButton {...props}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
          <Card className="bg-white shadow-md rounded-lg w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Flower className="text-white" size={40} />
                </div>
              </div>
              <CardTitle>서로 가꾸는 42</CardTitle>
            </CardHeader>
              {user ? (
                <CardContent className="px-6 py-6">
                  <div className="space-y-4 text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.email}</h2>
                    <p className="text-sm text-gray-600">UID: {user.uid}</p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Button onClick={main} className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-300 ease-in-out">
                      Go Main
                    </Button>
                    <Button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition duration-300 ease-in-out">
                      Logout
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <>
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
              </>
            )}
          </Card>
        </div>
      </Panel>
    );
}

export default LoginPanel;
