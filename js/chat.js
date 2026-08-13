// ==========================================
// KULZZY RADIO LIVE COMMUNITY
// chat.js
// VERSION 4.0
// ==========================================

import {

    db,

    ref,
    push,
    set,
    update,
    get,

    onValue,
    onChildAdded,

    onDisconnect,
    serverTimestamp

} from "./firebase.js";


// ==========================================
// CLOUDINARY
// ==========================================

const CLOUDINARY_CLOUD_NAME =
    "s4j0x7dk";

const CLOUDINARY_UPLOAD_PRESET =
    "Community Chat";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


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
// CURRENT LISTENER
// ==========================================

let listenerId =
    localStorage.getItem(
        "kulzzyListenerId"
    );


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
// NAME
// ==========================================

function getName() {

    return (

        localStorage.getItem("krName") ||

        localStorage.getItem("listenerName") ||

        "Listener"

    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// ==========================================
// PRESENCE
// ==========================================

function setupPresence() {

    const connectedRef =
        ref(
            db,
            ".info/connected"
        );

    const connectionRef =
        ref(
            db,
            "presence/" +
            listenerId
        );

    onValue(
        connectedRef,
        (snapshot) => {

            if (
                snapshot.val() !== true
            ) {
                return;
            }


            onDisconnect(
                connectionRef
            ).remove();


            set(
                connectionRef,
                {

                    name:
                        getName(),

                    online:
                        true,

                    lastSeen:
                        serverTimestamp()

                }
            );

        }
    );

}


setupPresence();


// ==========================================
// ACTIVE LISTENERS
// ==========================================

const activeListeners =
    document.getElementById(
        "activeListeners"
    );


if (activeListeners) {

    onValue(
        ref(db, "presence"),
        (snapshot) => {

            const data =
                snapshot.val() || {};

            const count =
                Object.keys(data).length;


            activeListeners.innerHTML = `

                <div class="listenerIcon">
                    👥
                </div>

                <span>
                    ${count} ${
                        count === 1
                        ? "Listener"
                        : "Listeners"
                    } Online
                </span>

            `;

        }
    );

}


// ==========================================
// SEND MESSAGE
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


    try {

        await push(
            ref(db, "chat"),
            {

                type:
                    "text",

                listenerId:
                    listenerId,

                name:
                    getName(),

                text:
                    text,

                time:
                    Date.now()

            }
        );


        messageBox.value = "";

    }

    catch (error) {

        console.error(error);

        alert(
            "Message could not be sent."
        );

    }

}


// ==========================================
// DISPLAY TEXT CHAT
// ==========================================

onChildAdded(
    ref(db, "chat"),
    (snapshot) => {

        const data =
            snapshot.val();

        if (!data) return;


        displayTextMessage(
            data
        );

    }
);


function displayTextMessage(data) {

    const msg =
        document.createElement("div");


    msg.className =
        "communityMessage";


    msg.innerHTML = `

        <div class="messageName">

            ${escapeHTML(
                data.name ||
                "Listener"
            )}

        </div>

        <div class="messageText">

            ${escapeHTML(
                data.text ||
                ""
            )}

        </div>

    `;


    messages.appendChild(
        msg
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// ==========================================
// CREATE POST BUTTON
// ==========================================

function createPostPicker() {

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
            "image/jpeg,image/png,image/webp";

        picker.style.display =
            "none";

        document.body.appendChild(
            picker
        );


        picker.addEventListener(
            "change",
            handlePictureUpload
        );

    }


    picker.value = "";

    picker.click();

}


// ==========================================
// CLOUDINARY IMAGE UPLOAD
// ==========================================

async function handlePictureUpload(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    // IMAGE ONLY

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Only pictures are allowed."
        );

        return;

    }


    // EXTRA PROTECTION

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Only JPG, PNG and WEBP pictures are allowed."
        );

        return;

    }


    // 5MB MAXIMUM

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Picture must be 5MB or smaller."
        );

        return;

    }


    try {

        alert(
            "📸 Uploading picture..."
        );


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );


        const response =
            await fetch(
                CLOUDINARY_UPLOAD_URL,
                {

                    method:
                        "POST",

                    body:
                        formData

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.secure_url
        ) {

            console.error(
                result
            );

            throw new Error(
                "Cloudinary upload failed"
            );

        }


        // SAVE POST IN FIREBASE

        await push(
            ref(db, "posts"),
            {

                listenerId:
                    listenerId,

                name:
                    getName(),

                imageURL:
                    result.secure_url,

                likes:
                    0,

                views:
                    0,

                comments:
                    0,

                time:
                    Date.now()

            }
        );


        alert(
            "✅ Picture posted!"
        );

    }

    catch (error) {

        console.error(
            "Upload error:",
            error
        );

        alert(
            "Picture upload failed. Check your Cloudinary upload preset."
        );

    }

}


// ==========================================
// DISPLAY POSTS
// ==========================================

onChildAdded(
    ref(db, "posts"),
    (snapshot) => {

        const data =
            snapshot.val();

        if (!data) return;


        displayPost(
            snapshot.key,
            data
        );

    }
);


// ==========================================
// DISPLAY POST
// ==========================================

function displayPost(
    postId,
    data
) {

    const post =
        document.createElement(
            "div"
        );


    post.className =
        "picturePost";


    post.dataset.postId =
        postId;


    post.innerHTML = `

        <div class="postHeader">

            <div class="postAvatar">
                👤
            </div>

            <div class="postUser">

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

            alt="Community Post"

            loading="lazy"

        >


        <div class="postActions">

            <button
                class="likeButton">

                ❤️
                <span class="likeCount">
                    ${data.likes || 0}
                </span>

            </button>


            <button
                class="commentButton">

                💬
                <span>
                    Comment
                </span>

            </button>


            <span class="postViewCount">

                👁️
                ${data.views || 0}

            </span>

        </div>


        <div class="commentArea">

            <div
                class="comments"
                id="comments-${postId}">
            </div>


            <div class="commentInputRow">

                <input
                    class="commentInput"
                    placeholder="Write a comment...">

                <button
                    class="commentSend">

                    ➤

                </button>

            </div>

        </div>

    `;


    messages.appendChild(
        post
    );


    setupPostEvents(
        post,
        postId,
        data
    );


    loadComments(
        postId,
        post
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// ==========================================
// POST EVENTS
// ==========================================

function setupPostEvents(
    post,
    postId,
    data
) {

    const likeButton =
        post.querySelector(
            ".likeButton"
        );


    const commentInput =
        post.querySelector(
            ".commentInput"
        );


    const commentSend =
        post.querySelector(
            ".commentSend"
        );


    const image =
        post.querySelector(
            ".postImage"
        );


    likeButton.addEventListener(
        "click",
        () => {

            toggleLike(
                postId,
                data,
                likeButton
            );

        }
    );


    commentSend.addEventListener(
        "click",
        () => {

            addComment(
                postId,
                data,
                commentInput,
                post
            );

        }
    );


    commentInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                addComment(
                    postId,
                    data,
                    commentInput,
                    post
                );

            }

        }
    );


    image.addEventListener(
        "click",
        () => {

            registerView(
                postId
            );

        }
    );

}


// ==========================================
// LIKE
// ==========================================

async function toggleLike(
    postId,
    postData,
    button
) {

    const likeRef =
        ref(
            db,
            "postLikes/" +
            postId +
            "/" +
            listenerId
        );


    const postRef =
        ref(
            db,
            "posts/" +
            postId
        );


    try {

        const existing =
            await get(
                likeRef
            );


        const postSnapshot =
            await get(
                postRef
            );


        if (
            !postSnapshot.exists()
        ) return;


        const current =
            postSnapshot.val();


        let count =
            Number(
                current.likes || 0
            );


        if (
            existing.exists()
        ) {

            await set(
                likeRef,
                null
            );

            count =
                Math.max(
                    0,
                    count - 1
                );

            button.classList.remove(
                "liked"
            );

        }

        else {

            await set(
                likeRef,
                {

                    name:
                        getName(),

                    time:
                        Date.now()

                }
            );

            count++;

            button.classList.add(
                "liked"
            );


            // NOTIFICATION

            if (
                current.listenerId &&
                current.listenerId !==
                listenerId
            ) {

                await createNotification(
                    current.listenerId,
                    "like",
                    getName(),
                    postId
                );

            }

        }


        await update(
            postRef,
            {

                likes:
                    count

            }
        );


        const countElement =
            button.querySelector(
                ".likeCount"
            );


        if (countElement) {

            countElement.textContent =
                count;

        }

    }

    catch (error) {

        console.error(
            "Like error:",
            error
        );

    }

}


// ==========================================
// COMMENTS
// ==========================================

async function addComment(
    postId,
    postData,
    input,
    post
) {

    const text =
        input.value.trim();


    if (!text) return;


    try {

        await push(
            ref(
                db,
                "comments/" +
                postId
            ),
            {

                listenerId:
                    listenerId,

                name:
                    getName(),

                text:
                    text,

                time:
                    Date.now()

            }
        );


        input.value = "";


        const postRef =
            ref(
                db,
                "posts/" +
                postId
            );


        const snapshot =
            await get(
                postRef
            );


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            await update(
                postRef,
                {

                    comments:
                        Number(
                            data.comments ||
                            0
                        ) + 1

                }
            );


            if (
                data.listenerId &&
                data.listenerId !==
                listenerId
            ) {

                await createNotification(
                    data.listenerId,
                    "comment",
                    getName(),
                    postId
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Comment error:",
            error
        );

    }

}


// ==========================================
// LOAD COMMENTS
// ==========================================

function loadComments(
    postId,
    post
) {

    const commentsBox =
        post.querySelector(
            ".comments"
        );


    onChildAdded(
        ref(
            db,
            "comments/" +
            postId
        ),
        (snapshot) => {

            const data =
                snapshot.val();


            if (!data) return;


            const comment =
                document.createElement(
                    "div"
                );


            comment.className =
                "commentBubble";


            comment.innerHTML = `

                <strong>
                    ${escapeHTML(
                        data.name ||
                        "Listener"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        data.text ||
                        ""
                    )}
                </span>

            `;


            commentsBox.appendChild(
                comment
            );

        }
    );

}


// ==========================================
// VIEWS
// ==========================================

async function registerView(
    postId
) {

    const viewRef =
        ref(
            db,
            "postViews/" +
            postId +
            "/" +
            listenerId
        );


    const postRef =
        ref(
            db,
            "posts/" +
            postId
        );


    try {

        const existing =
            await get(
                viewRef
            );


        if (
            existing.exists()
        ) return;


        await set(
            viewRef,
            {

                name:
                    getName(),

                time:
                    Date.now()

            }
        );


        const snapshot =
            await get(
                postRef
            );


        if (
            !snapshot.exists()
        ) return;


        const data =
            snapshot.val();


        await update(
            postRef,
            {

                views:
                    Number(
                        data.views ||
                        0
                    ) + 1

            }
        );

    }

    catch (error) {

        console.error(
            "View error:",
            error
        );

    }

}


// ==========================================
// FOLLOW
// ==========================================

async function followUser(
    targetId,
    targetName,
    button
) {

    if (
        !targetId ||
        targetId === listenerId
    ) return;


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
            await get(
                followRef
            );


        if (
            existing.exists()
        ) {

            await set(
                followRef,
                null
            );


            button.textContent =
                "Follow";


            button.classList.remove(
                "following"
            );

        }

        else {

            await set(
                followRef,
                {

                    name:
                        getName(),

                    time:
                        Date.now()

                }
            );


            button.textContent =
                "✓ Following";


            button.classList.add(
                "following"
            );


            await createNotification(
                targetId,
                "follow",
                getName(),
                ""
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
// NOTIFICATIONS
// ==========================================

async function createNotification(
    targetUser,
    type,
    fromName,
    postId
) {

    if (
        !targetUser ||
        targetUser === listenerId
    ) return;


    await push(
        ref(
            db,
            "notifications/" +
            targetUser
        ),
        {

            type:
                type,

            fromName:
                fromName,

            postId:
                postId || "",

            read:
                false,

            time:
                Date.now()

        }
    );

}


// ==========================================
// NOTIFICATION COUNTER
// ==========================================

const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );


if (notificationBadge) {

    onValue(
        ref(
            db,
            "notifications/" +
            listenerId
        ),
        (snapshot) => {

            const data =
                snapshot.val() || {};


            const unread =
                Object.values(data)
                    .filter(
                        item =>
                            item &&
                            item.read === false
                    )
                    .length;


            notificationBadge.textContent =
                unread;


            notificationBadge.style.display =
                unread > 0
                ? "flex"
                : "none";

        }
    );

}


// ==========================================
// POST BUTTON
// ==========================================

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".postButton"
            );


        if (button) {

            createPostPicker();

        }


        const followButton =
            event.target.closest(
                ".followButton"
            );


        if (followButton) {

            followUser(

                followButton.dataset.user,

                followButton.dataset.name,

                followButton

            );

        }

    }
);


// ==========================================
// EMOJI
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
    "Kulzzy Radio Community v4 loaded."
);
