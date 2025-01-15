from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'your_secret_key'

socketio = SocketIO(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    username = request.args.get('username')
    if not username:
        return redirect(url_for('index'))
    return render_template('chat.html', username=username)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@socketio.on('message')
def handle_message(data):
    emit('message', data, broadcast=True)

@socketio.on('image')
def handle_image(data):
    image_data = data['image_data']
    filename = data['filename']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    with open(filepath, 'wb') as f:
        f.write(image_data)

    emit('image', {'username': data['username'], 'image_url': url_for('uploaded_file', filename=filename), 'filename': filename}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
