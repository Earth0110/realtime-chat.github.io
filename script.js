const firebaseConfig = {
    apiKey: "AIzaSyC9Ixs0DauT_UPlAS0Cv_oGYODqiQnwFUs",
    authDomain: "test-chat-by-earth.firebaseapp.com",
    databaseURL: "https://test-chat-by-earth-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "test-chat-by-earth",
    storageBucket: "test-chat-by-earth.appspot.com",
    messagingSenderId: "1009444037169",
    appId: "1:1009444037169:web:cf667807f753a7677d6b10",
    measurementId: "G-1JPX0LHRC3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");

const nameInput = document.getElementById("nameInput");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const imageInput = document.getElementById("imageInput");
const recordBtn = document.getElementById("recordBtn");
const themeToggle = document.getElementById("themeToggle");

messagesRef.on("child_added", function(snapshot) {
    const msg = snapshot.val();
    const msgDiv = document.createElement("div");
    msgDiv.className = "message";

    const isOwn = msg.name === nameInput.value.trim();
    msgDiv.classList.add(isOwn ? 'own' : 'other');

    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = msg.name;
    nameSpan.style.color = isOwn ? '#fff' : 'hsl(' + (msg.name.charCodeAt(0) * 13 % 360) + ',70%,60%)';

    const contentSpan = document.createElement("span");
    if (msg.image) {
        const img = document.createElement("img");
        img.src = msg.image;
        img.style.maxWidth = "100%";
        contentSpan.appendChild(img);
    } else if (msg.audio) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = msg.audio;
        contentSpan.appendChild(audio);
    } else {
        contentSpan.textContent = msg.text;
    }

    const timeSpan = document.createElement("div");
    timeSpan.className = "timestamp";
    timeSpan.textContent = new Date(msg.time).toLocaleTimeString();

    msgDiv.appendChild(nameSpan);
    msgDiv.appendChild(contentSpan);
    msgDiv.appendChild(timeSpan);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function sendMessage() {
    const name = nameInput.value.trim();
    const text = messageInput.value.trim();
    const file = imageInput.files[0];
    if (!name) return alert("กรุณาใส่ชื่อก่อนแชท");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            messagesRef.push({ name, image: e.target.result, time: Date.now() });
        };
        reader.readAsDataURL(file);
        imageInput.value = "";
        messageInput.value = "";
    } else if (text) {
        messagesRef.push({ name, text, time: Date.now() });
        messageInput.value = "";
    }
}

let mediaRecorder;
let audioChunks = [];

recordBtn.onmousedown = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = e => {
            messagesRef.push({
                name: nameInput.value.trim(),
                audio: e.target.result,
                time: Date.now()
            });
        };
        reader.readAsDataURL(blob);
        audioChunks = [];
    };
    mediaRecorder.start();
};

recordBtn.onmouseup = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
};

themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};
