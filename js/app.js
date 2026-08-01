// ==========================================
// Kulzzy Radio Live Community
// app.js
// Version 2.5.0
// ==========================================

import {
    db,
    ref,
    onValue,
    set
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

if (nameInput) {
    nameInput.value = savedName;

    nameInput.addEventListener("input", () => {
        localStorage.setItem("krName", nameInput.value);

        if (welcomeName) {
            welcomeName.textContent =
                "Welcome, " + nameInput.value + "!";
        }
    });
}

if (welcomeName) {
    welcomeName.textContent =
        "Welcome, " + savedName + "!";
}

// ==============================
// LISTEN LIVE BUTTON
// ==============================

const listenBtn = document.getElementById("listenBtn");

if (listenBtn) {

    listenBtn.addEventListener("click", () => {

        alert("🎧 Live Stream will be connected in the next milestone.");

    });

}

// ==============================
// ANNOUNCEMENT
// ==============================

const announcementElement =
    document.getElementById("announcement");

if (announcementElement) {

    const announcementRef =
        ref(db, "announcement");

    onValue(announcementRef, (snapshot) => {

        announcementElement.textContent =
            snapshot.val() ||
            "No announcement available.";

    });

}

// ==============================
// CELEBRANTS
// ==============================

const celebrantsElement =
    document.getElementById("celebrants");

if (celebrantsElement) {

    const celebrantsRef =
        ref(db, "celebrants");

    onValue(celebrantsRef, (snapshot) => {

        celebrantsElement.textContent =
            snapshot.val() ||
            "No celebrants available.";

    });

}

console.log("Kulzzy Radio Live Community Loaded");

// ==============================
// ACTIVE LISTENERS
// ==============================

const listenerId =
    localStorage.getItem("listenerId") ||
    ("listener_" + Date.now());

localStorage.setItem("listenerId", listenerId);

set(
    ref(db, "online/" + listenerId),
    {
        name: savedName,
        time: Date.now()
    }
);
