import { Server } from 'socket.io';

// In-memory game store: roomId -> { players: [{id,name,socketId}], scores: [int,int], status, winner }
const activeGames = new Map();

export default function handler(req, res) {
  if (!res.socket.server.io) {
  const io = new Server(res.socket.server, { path: '/api/socket' });

    io.on('connection', (socket) => {
      socket.on('join-room', ({ roomId, playerId, playerName }) => {
        try {
          socket.join(roomId);

          if (!activeGames.has(roomId)) {
            activeGames.set(roomId, {
              players: [],
              scores: [],
              status: 'waiting'
            });
          }

          const game = activeGames.get(roomId);

          // try to find existing player
          let idx = game.players.findIndex((p) => p.id === playerId);
          if (idx === -1) {
            if (game.players.length >= 2) {
              socket.emit('room-full');
              return;
            }
            game.players.push({ id: playerId, name: playerName, socketId: socket.id });
            game.scores.push(0);
            idx = game.players.length - 1;
          } else {
            // update socket id in case of reconnect
            game.players[idx].socketId = socket.id;
          }

          if (game.players.length === 2 && game.status !== 'finished') {
            game.status = 'playing';
          }

          io.to(roomId).emit('game-state', game);
        } catch (err) {
          console.error('join-room error', err);
        }
      });

      socket.on('press-button', ({ roomId, playerId }) => {
        try {
          const game = activeGames.get(roomId);
          if (!game || game.status !== 'playing') return;

          const playerIndex = game.players.findIndex((p) => p.id === playerId);
          if (playerIndex === -1) return;

          game.scores[playerIndex] = (game.scores[playerIndex] || 0) + 1;

          if (game.scores[playerIndex] >= 10) {
            game.status = 'finished';
            game.winner = playerIndex;
            // set finish timestamp 5s in the future
            game.finishAt = Date.now() + 5000;

            console.log(`Game ${roomId} finished by playerIndex=${playerIndex}, scheduling close in 5s`);

            // schedule cleanup and notify clients that room will close
            setTimeout(() => {
              // emit closing event so clients can redirect if needed
              try {
                io.to(roomId).emit('room-closed', { roomId });
                console.log(`Emitted room-closed for ${roomId}`);
              } catch (e) {
                console.error('emit room-closed error', e);
              }
              activeGames.delete(roomId);
            }, 5000);
          }

          io.to(roomId).emit('score-update', game);
        } catch (err) {
          console.error('press-button error', err);
        }
      });

      socket.on('disconnect', () => {
        // Cleanup: remove player from any room they were in
        for (const [roomId, game] of activeGames.entries()) {
          const idx = game.players.findIndex((p) => p.socketId === socket.id);
          if (idx !== -1) {
            game.players.splice(idx, 1);
            game.scores.splice(idx, 1);
            // if no players left, remove room
            if (game.players.length === 0) {
              activeGames.delete(roomId);
            } else {
              io.to(roomId).emit('game-state', game);
            }
            break;
          }
        }
      });
    });

    res.socket.server.io = io;
    console.log('Socket.IO server initialized');
  }

  res.end();
}
