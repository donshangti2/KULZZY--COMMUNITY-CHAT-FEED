import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    update,
    get,
    onChildAdded,
    onValue,
    query,
    limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyBH85NGWsSAK5cubbPdnmunwYZFZpj_CB0",

    authDomain:
        "kulzzy-radio-chat.firebaseapp.com",

    databaseURL:
        "https://kulzzy-radio-chat-default-rtdb.europe-west1.firebasedatabase.app",

    projectId:
        "kulzzy-radio-chat",

    storageBucket:
        "kulzzy-radio-chat.firebasestorage.app",

    messagingSenderId:
        "510100635134",

    appId:
        "1:510100635134:web:9d3b2e983eb6e9a385d4af"

};


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const storage = getStorage(app);


export {

    app,

    db,

    storage,

    ref,
    push,
    set,
    update,
    get,

    query,
    limitToLast,

    onValue,
    onChildAdded

};
