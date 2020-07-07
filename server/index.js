const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const PORT = process.env.PORT || 5000
const app = express()

const { addUser, removeUser, getUser, getUsersinroom } = require('./users')

const router = require('./router')

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        if (error) {
            return callback(error);
        }

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the ${user.room}` });

        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined the chat` })

        socket.join(user.room);

        callback();
    })


    socket.on('e', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', { user: user.name, text: message })

        callback();
    })

    socket.on('disconnect', () => {
        console.log('User had left')
    })
});

app.use(router);

server.listen(PORT, () => console.log(`server has started on port ${PORT}`))

