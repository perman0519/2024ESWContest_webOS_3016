// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyBfc8OlhEQ-wIpNL3l2v-mTRPVl0droKRY",

  authDomain: "smartfarm-ddbc3.firebaseapp.com",

  databaseURL: "https://smartfarm-ddbc3-default-rtdb.firebaseio.com",

  projectId: "smartfarm-ddbc3",

  storageBucket: "smartfarm-ddbc3.appspot.com",

  messagingSenderId: "945689382597",

  appId: "1:945689382597:web:ca23f3de21c44e2645aaac"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
