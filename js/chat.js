// ==========================================
// KULZZY RADIO LIVE COMMUNITY
// chat.js
// Text Chat + Picture Posts + Follow + Views
// ==========================================


import {

    db,
    storage,
    ref,
    push,
    set,
    update,
    get,
    onValue,
    onChildAdded

} from "./firebase.js";


import {

    ref as storageRef,
    uploadBytes,
    getDownloadURL

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// ==========================================
// ELEMENTS
// ==========================================

const sendBtn =
    document.getElementById("send");

const messageBox =
    document.getElementById("message");

const messages =
    document.getElementById("messages");

const emojiBtn =
    document.getElementById("emojiBtn");


// ==========================================
// LISTENER ID
// ==========================================

let listenerId =
    localStorage.getItem("kulzzyListenerId");


if (!listenerId) {

    listenerId =
        "listener_" +
        Math.random()
            .toString(36)
            .substring(2, 12);

    localStorage.setItem(
        "kulzzyListenerId",
        listenerId
    );

}


// ==========================================
// GET NAME
// ==========================================

function getListenerName() {

    return (

        localStorage.getItem("krName") ||

        localStorage.getItem("listenerName") ||

        "Listener"

    );

}


// ==========================================
// ESCAPE TEXT
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// SEND TEXT MESSAGE
// ==========================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


if (messageBox) {

    messageBox.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


async function sendMessage() {

    const text =
        messageBox.value.trim();


    if (!text) return;


    const name =
        getListenerName();


    try {

        await push(
            ref(db, "chat"),
            {

                listenerId:
                    listenerId,

                name:
                    name,

                text:
                    text,

                time:
                    Date.now()

            }
        );


        messageBox.value = "";

    }

    catch (error) {

        console.error(
            "Message error:",
            error
        );

        alert(
            "Message could not be sent. Please try again."
        );

    }

}


// ==========================================
// DISPLAY TEXT MESSAGES
// ==========================================

onChildAdded(
    ref(db, "chat"),
    (snapshot) => {

        const data =
            snapshot.val();


        if (!data) return;


        const msg =
            document.createElement("div");


        msg.className =
            "communityMessage";


        msg.innerHTML = `

            <div class="messageName">
                ${escapeHTML(
                    data.name || "Listener"
                )}
            </div>

            <div class="messageText">
                ${escapeHTML(
                    data.text || ""
                )}
            </div>

            <div class="listenerActions">

                <button
                    class="postBtn"
                    data-user="${escapeHTML(
                        data.listenerId || ""
                    )}">
                    📷 Post
                </button>

                <button
                    class="followBtn"
                    data-user="${escapeHTML(
                        data.listenerId || ""
                    )}"
                    data-name="${escapeHTML(
                        data.name || "Listener"
                    )}">
                    👤 Follow
                </button>

                <span
                    class="viewCounter"
                    data-user="${escapeHTML(
                        data.listenerId || ""
                    )}">
                    👁️ 0
                </span>

            </div>

        `;


        messages.appendChild(msg);


        messages.scrollTop =
            messages.scrollHeight;


        setupListenerButtons(msg);

    }
);


// ==========================================
// SETUP LISTENER BUTTONS
// ==========================================

function setupListenerButtons(container) {


    const postBtn =
        container.querySelector(".postBtn");


    const followBtn =
        container.querySelector(".followBtn");


    if (postBtn) {

        postBtn.addEventListener(
            "click",
            () => {

                openPostPicker();

            }
        );

    }


    if (followBtn) {

        const targetId =
            followBtn.dataset.user;

        const targetName =
            followBtn.dataset.name;


        if (
            targetId === listenerId
        ) {

            followBtn.style.display =
                "none";

        }


        followBtn.addEventListener(
            "click",
            () => {

                followListener(
                    targetId,
                    targetName,
                    followBtn
                );

            }
        );

    }

}


// ==========================================
// PICTURE POST PICKER
// ==========================================

function openPostPicker() {


    let picker =
        document.getElementById(
            "picturePostPicker"
        );


    if (!picker) {

        picker =
            document.createElement(
                "input"
            );

        picker.type =
            "file";

        picker.id =
            "picturePostPicker";

        picker.accept =
            "image/jpeg,image/png,image/webp,image/gif";

        picker.style.display =
            "none";

        document.body.appendChild(
            picker
        );


        picker.addEventListener(
            "change",
            handlePicturePost
        );

    }


    picker.value = "";

    picker.click();

}


// ==========================================
// HANDLE PICTURE POST
// ==========================================

async function handlePicturePost(event) {


    const file =
        event.target.files[0];


    if (!file) return;


    // ONLY IMAGE FILES

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Only pictures are allowed. Audio and video cannot be posted."
        );

        return;

    }


    // MAX 5MB

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Picture must not be larger than 5MB."
        );

        return;

    }


    const name =
        getListenerName();


    try {


        alert(
            "📷 Uploading your picture..."
        );


        const fileName =
            Date.now() +
            "_" +
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const imageRef =
            storageRef(
                storage,
                "communityPosts/" +
                listenerId +
                "/" +
                fileName
            );


        const uploadResult =
            await uploadBytes(
                imageRef,
                file
            );


        const imageURL =
            await getDownloadURL(
                uploadResult.ref
            );


        await push(
            ref(db, "posts"),
            {

                listenerId:
                    listenerId,

                name:
                    name,

                imageURL:
                    imageURL,

                views:
                    0,

                time:
                    Date.now()

            }
        );


        alert(
            "✅ Picture posted successfully!"
        );


    }

    catch (error) {

        console.error(
            "Picture upload error:",
            error
        );


        alert(
            "Picture could not be posted. Please try again."
        );

    }

}


// ==========================================
// FOLLOW LISTENER
// ==========================================

async function followListener(
    targetId,
    targetName,
    button
) {


    if (!targetId) return;


    if (
        targetId === listenerId
    ) {

        return;

    }


    const followRef =
        ref(
            db,
            "followers/" +
            targetId +
            "/" +
            listenerId
        );


    try {

        const existing =
            await get(followRef);


        if (existing.exists()) {

            await set(
                followRef,
                null
            );


            button.textContent =
                "👤 Follow";

            button.classList.remove(
                "following"
            );

        }

        else {

            await set(
                followRef,
                {

                    name:
                        getListenerName(),

                    followedName:
                        targetName,

                    time:
                        Date.now()

                }
            );


            button.textContent =
                "✓ Following";

            button.classList.add(
                "following"
            );

        }

    }

    catch (error) {

        console.error(
            "Follow error:",
            error
        );

    }

}


// ==========================================
// LOAD PICTURE POSTS
// ==========================================

onChildAdded(
    ref(db, "posts"),
    (snapshot) => {

        const data =
            snapshot.val();


        if (!data) return;


        displayPicturePost(
            snapshot.key,
            data
        );

    }
);


// ==========================================
// DISPLAY PICTURE POST
// ==========================================

function displayPicturePost(
    postId,
    data
) {


    const post =
        document.createElement("div");


    post.className =
        "picturePost";


    post.innerHTML = `

        <div class="postHeader">

            <div class="postAvatar">
                👤
            </div>

            <div>

                <strong>
                    ${escapeHTML(
                        data.name ||
                        "Listener"
                    )}
                </strong>

                <small>
                    Picture Post
                </small>

            </div>

        </div>


        <img
            src="${data.imageURL}"
            class="postImage"
            alt="Community picture"
            loading="lazy"
        >


        <div class="postFooter">

            <button
                class="followPostBtn"
                data-user="${
                    data.listenerId || ""
                }"
                data-name="${
                    escapeHTML(
                        data.name ||
                        "Listener"
                    )
                }">

                👤 Follow

            </button>


            <span
                class="postViews"
                id="views-${postId}">

                👁️ ${
                    Number(
                        data.views || 0
                    )
                }

            </span>

        </div>

    `;


    messages.appendChild(
        post
    );


    messages.scrollTop =
        messages.scrollHeight;


    const image =
        post.querySelector(
            ".postImage"
        );


    image.addEventListener(
        "click",
        () => {

            registerPostView(
                postId,
                data
            );

        }
    );


    const followBtn =
        post.querySelector(
            ".followPostBtn"
        );


    if (
        data.listenerId ===
        listenerId
    ) {

        followBtn.style.display =
            "none";

    }


    followBtn.addEventListener(
        "click",
        () => {

            followListener(
                data.listenerId,
                data.name,
                followBtn
            );

        }
    );

}


// ==========================================
// REGISTER POST VIEW
// ==========================================

async function registerPostView(
    postId,
    data
) {


    const viewKey =
        listenerId;


    const viewRef =
        ref(
            db,
            "postViews/" +
            postId +
            "/" +
            viewKey
        );


    try {

        const alreadyViewed =
            await get(viewRef);


        if (
            alreadyViewed.exists()
        ) {

            return;

        }


        await set(
            viewRef,
            {

                listenerId:
                    listenerId,

                name:
                    getListenerName(),

                time:
                    Date.now()

            }
        );


        const postRef =
            ref(
                db,
                "posts/" +
                postId
            );


        const postSnapshot =
            await get(postRef);


        if (
            postSnapshot.exists()
        ) {

            const postData =
                postSnapshot.val();


            const newViews =
                Number(
                    postData.views || 0
                ) + 1;


            await update(
                postRef,
                {

                    views:
                        newViews

                }
            );


            const counter =
                document.getElementById(
                    "views-" +
                    postId
                );


            if (counter) {

                counter.textContent =
                    "👁️ " +
                    newViews;

            }

        }

    }

    catch (error) {

        console.error(
            "View error:",
            error
        );

    }

}


// ==========================================
// EMOJI BUTTON
// ==========================================

if (emojiBtn) {

    emojiBtn.addEventListener(
        "click",
        () => {

            messageBox.value +=
                " 😊";

            messageBox.focus();

        }
    );

}


console.log(
    "Kulzzy Radio Community Chat loaded."
);
