const initializeApp = require('firebase/app').initializeApp;
const getDatabase = require('firebase/database').getDatabase;
require('dotenv').config({ path: './.env' });

// firebase init
const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// const storage = getStorage(app);

// module.exports = {database, storage};
module.exports = {database};
