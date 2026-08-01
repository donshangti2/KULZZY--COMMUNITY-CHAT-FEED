import {
  db,
  ref,
  push,
  onChildAdded
} from "./firebase.js";

const sendBtn = document.getElementById("send");
const messageBox = document.getElementById("message");
const messages = document.getElementById("messages");
const nameInput = document.getElementById("name");

sendBtn.addEventListener("click", () => {

    const name =
        nameInput.value.trim() || "Anonymous";

    const text =
        messageBox.value.trim();

    if (text === "") return;

    push(ref(db, "chat"), {

        name: name,
        text: text,
        time: Date.now()

    });

    messageBox.value = "";

});

onChildAdded(ref(db, "chat"), (snapshot) => {

    const data = snapshot.val();

    const message = document.createElement("div");

    message.className = "chatMessage";

    message.innerHTML =
        `<strong>${data.name}</strong><br>${data.text}`;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;

});
