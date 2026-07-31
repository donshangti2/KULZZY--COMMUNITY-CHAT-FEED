function sendMessage() {

    const name = nameInput.value.trim();

    const messageBox = document.getElementById("message");

    const message = messageBox.value.trim();

    if (name === "" || message === "") {

        alert("Please enter your name and message.");

        return;

    }

    push(messagesRoot, {

        userId: localStorage.getItem("krUserId") || "guest",

        name: name,

        photo: localStorage.getItem("krProfilePhoto") || "",

        message: message,

        time: Date.now()

    });

    messageBox.value = "";

    messageBox.focus();

}
