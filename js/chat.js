import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { app } from "./firebase.js";

const db = getDatabase(app);

const sendBtn = document.getElementById("send");
const messageBox = document.getElementById("message");
const messages = document.getElementById("messages");

sendBtn.onclick = () => {

  const name =
    localStorage.getItem("listenerName") || "Anonymous";

  const text = messageBox.value.trim();

  if (!text) return;

  push(ref(db, "chat"), {
    name,
    text,
    time: Date.now()
  });

  messageBox.value = "";

};

onChildAdded(ref(db, "chat"), (snapshot) => {

  const data = snapshot.val();

  const msg = document.createElement("p");

  msg.innerHTML =
    `<strong>${data.name}:</strong> ${data.text}`;

  messages.appendChild(msg);

  messages.scrollTop = messages.scrollHeight;

});
