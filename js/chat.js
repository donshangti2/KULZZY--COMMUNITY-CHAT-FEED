// ==========================================
// Kulzzy Radio Live Community
// Chat Engine
// Version 2.5.0
// ==========================================

import {
    db,
    ref,
    push,
    onChildAdded
} from "./firebase.js";

const messagesRef = ref(db, "messages");

console.log("Chat Engine Ready");

// More chat functions will be added next.
