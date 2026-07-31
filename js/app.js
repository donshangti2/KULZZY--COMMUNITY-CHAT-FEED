import {
  db,
  ref,
  onValue
} from "./firebase.js";

// ==============================
// USER
// ==============================

const nameInput = document.getElementById("name");
const welcomeName = document.getElementById("welcomeName");

let savedName = localStorage.getItem("krName");

if (!savedName) {

    savedName = "Listener " + Math.floor(Math.random() * 900 + 100);

    localStorage.setItem("krName", savedName);

}

if(nameInput){

    nameInput.value = savedName;

}

if(welcomeName){

    welcomeName.textContent = "Welcome, " + savedName + "!";

}

if(nameInput){

    nameInput.addEventListener("input", ()=>{

        localStorage.setItem("krName", nameInput.value);

        if(welcomeName){

            welcomeName.textContent =
            "Welcome, " + nameInput.value + "!";

        }

    });

}

// ==============================
// SEND BUTTON
// ==============================

const sendBtn = document.getElementById("send");

if(sendBtn){

    sendBtn.addEventListener("click", sendMessage);

}

function sendMessage(){

    console.log("Send Message - next step");

        }
