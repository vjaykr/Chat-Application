function initializeSocket(username) {
    var socket = io();

    socket.on('message', function(data){
        var chatBox = document.getElementById('chat-box');
        var newMessage = document.createElement('div');
        newMessage.classList.add('message');
        newMessage.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on('image', function(data){
        var chatBox = document.getElementById('chat-box');
        var newMessage = document.createElement('div');
        newMessage.classList.add('message');
        newMessage.innerHTML = `
            <strong>${data.username}:</strong><br>
            <button class="view-button" onclick="openImageModal('${data.image_url}', '${data.filename}')">View Image</button>
        `;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
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
            reader.readAsArrayBuffer(file);
        }
    });
}

function sendMessage(socket, username) {
    var input = document.getElementById('message-input');
    var message = input.value;
    socket.send({'username': username, 'message': message});
    input.value = '';
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
}
