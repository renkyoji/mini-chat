const express = require('express')
const app = express()
const server = require('http').createServer(app)
const useSocket = require('socket.io')
const io = useSocket(server)


app.use(express.json());


const rooms = new Map();

app.get('/rooms/:id', (req, res) => {
    const { id: roomId } = req.params;
    const obj = rooms.has(roomId)
        ? {
            users: [...rooms.get(roomId).get('users').values()],
            messages: [...rooms.get(roomId).get('messages').values()],
        }
        : { users: [], messages: [] };
    res.json(obj);
});

app.post('/rooms', (req, res) => {
    const { roomId, userName } = req.body;
    if (!rooms.has(roomId)) {
        rooms.set(
            roomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
            ]),
        );
    }
    res.send();
});

io.on('connection', (socket) => {
    socket.on('ROOM:JOIN', ({ roomId, userName }) => {
        socket.join(roomId);
        rooms.get(roomId).get('users').set(socket.id, userName);
        const users = [...rooms.get(roomId).get('users').values()];
        socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
    });

    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = {
            userName,
            text,
        };
        rooms.get(roomId).get('messages').push(obj);
        socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGE', obj);
    });

    socket.on('disconnect', () => {
        rooms.forEach((value, roomId) => {
            if (value.get('users').delete(socket.id)) {
                const users = [...value.get('users').values()];
                socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
            }
        });
    });

    console.log('user connected', socket.id);
});

server.listen(9999, (err) => {
    if (err) {
        throw Error(err);
    }
    console.log('Сервер запущен!');
});



// const jsonServer = require('json-server');
// const server = jsonServer.create();
// const router = jsonServer.router('./public/database.json');
// const middlewares = jsonServer.defaults({
//     static: './build',
// });
//
// const PORT = process.env.PORT || 3001;
//
// server.use(middlewares);
// server.use(router);
//
// server.listen(PORT, () => {
//     console.log('Server is running');
// });