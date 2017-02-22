const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// read index into memory
const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

// pass int he http server to socketio and grab the websocker server as io
const io = socketio(app);

const squares = {};

const makeSquare = (val, socket) => {
  console.log(`Making new Square at ${val}`);
  squares[socket.uID] = {};

  squares[socket.uID].x = val;
  squares[socket.uID].y = val;
  squares[socket.uID].uID = socket.uID;
};

const listeners = (sock) => {
  const socket = sock;

  socket.on('newSquare', (data) => {
    makeSquare(data.val, socket);
  });

  socket.on('join', () => {
    socket.join('room1');

    const nDate = new Date().getTime();
    socket.uID = `${socket.id}${nDate}`;

    socket.emit('uID', { uID: socket.uID });
  });

  socket.on('updateSquares', (data) => {
    squares[data.uID].x = data.val;
    squares[data.uID].y = data.val;
  });

  socket.on('disconnect', () => {
    delete (squares[socket.uID]);
  });
};

io.sockets.on('connection', (socket) => {
  console.log('someone joined');

  listeners(socket);
});

setInterval(() => {
  io.sockets.in('room1').emit('giveSquares', { squares });
}, 10);

console.log('Websocket server started');
