function initializeSocket(username) {
    var socket = io();

    socket.on('connect', function() {
        socket.emit('user_status', { username: username, status: 'online' });
    });

    socket.on('disconnect', function() {
        socket.emit('user_status', { username: username, status: 'offline' });
    });

    socket.on('message', function(data) {
        appendMessage(data.username, data.message);
    });

    socket.on('image', function(data) {
        appendImageMessage(data.username, data.image_url, data.filename);
    });

    socket.on('user_status', function(data) {
        appendStatusMessage(data.username, data.status);
    });

    document.getElementById('message-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage(socket, username);
        }
    });

    document.getElementById('image-input').addEventListener('change', function() {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var arrayBuffer = e.target.result;
                var image_data = new Uint8Array(arrayBuffer);
                var filename = file.name;
                socket.emit('image', {'username': username, 'image_data': image_data, 'filename': filename});
            };
            reader.onerror = function() {
                alert("Error reading file.");
            };
            reader.readAsArrayBuffer(file);
        }
    });
}

function sendMessage(socket, username) {
    var input = document.getElementById('message-input');
    var message = input.value;
    if (message.trim() !== "") {
        socket.send({'username': username, 'message': message});
        input.value = '';
    }
}

function appendMessage(username, message) {
    var chatBox = document.getElementById('chat-box');
    var newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendImageMessage(username, imageUrl, filename) {
    var chatBox = document.getElementById('chat-box');
    var newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.innerHTML = `
        <strong>${username}:</strong><br>
        <button class="view-button" onclick="openImageModal('${imageUrl}', '${filename}')">View Image</button>
    `;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendStatusMessage(username, status) {
    var chatBox = document.getElementById('chat-box');
    var newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.innerHTML = `<em>${username} is ${status}</em>`;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function openImageModal(imageUrl, filename) {
    var modal = document.getElementById('image-modal');
    var modalImg = document.getElementById('modal-image');
    var captionText = document.getElementById('caption');

    modal.style.display = "block";
    modalImg.src = imageUrl;
    captionText.innerHTML = filename;

    var closeModal = document.getElementsByClassName('close-modal')[0];
    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    // Close modal when clicking outside of the image
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Close modal on escape key press
    document.onkeydown = function(event) {
        if (event.key === "Escape") {
            modal.style.display = "none";
        }
    };
}
