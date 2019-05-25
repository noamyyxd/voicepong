const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const io = require('socket.io').listen(server);
let players = {};
let playerNumber = 0;

app.use('/public', express.static('client'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./client/view/index.html'));
});

io.on('connection', (socket) => {
    if (Object.keys(players).length < 2) {
        console.log('a user connected ' + socket.id);
        players[socket.id] = {
            playerId: socket.id,
            playerNumber: playerNumber,
            ready: false
        };
        playerNumber = (playerNumber + 1) % 2;
        
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);

        // when a player disconnects, remove them from our players object
        socket.on('disconnect', () => {
            console.log('user disconnected');

            // remove this player from our players object
            delete players[socket.id];

            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });

        socket.on('ready', (data) => {
            players[socket.id].ready = true;
            console.log("player " + players[socket.id].playerId + " is ready");
            if ((Object.keys(players).length === 2) 
                && !(Object.values(players).map((player) => player.ready).includes(false))) {
                console.log('start game');
                io.emit('startGame');
            }
        });

        // when a player moves, update the player data
        socket.on('playerMovement', (movementData) => {
            players[socket.id].y = movementData.y;
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', players[socket.id]);
        });

        // when a player moves, update the player data
        socket.on('playerStopped', () => {
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerStopped');
        });

        socket.on('hit', (diskData) => {
            socket.broadcast.emit('playerHit', diskData);
        })
    } 
});

server.listen(1010, () => {
    console.log(`Listening on ${server.address().port}`);
});

//app.listen(1010);