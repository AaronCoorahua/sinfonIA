const activeGames = new Map();

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    
    io.on('connection', (socket) => {
      socket.on('join-room', ({ roomId, playerId, playerName }) => {
        socket.join(roomId);
        
        if (!activeGames.has(roomId)) {
          activeGames.set(roomId, {
            players: [],
            scores: [0, 0],
            status: 'waiting'
          });
        }
        
        const game = activeGames.get(roomId);
        if (game.players.length < 2) {
          game.players.push({ id: playerId, name: playerName, socketId: socket.id });
          if (game.players.length === 2) game.status = 'playing';
        }
        
        io.to(roomId).emit('game-state', game);
      });
      
      socket.on('press-button', ({ roomId, playerId }) => {
        const game = activeGames.get(roomId);
        if (game.status !== 'playing') return;
        
        const playerIndex = game.players.findIndex(p => p.id === playerId);
        game.scores[playerIndex]++;
        
        if (game.scores[playerIndex] >= 10) {
          game.status = 'finished';
          game.winner = playerIndex;
        }
        
        io.to(roomId).emit('score-update', game);
      });
    });
    
    res.socket.server.io = io;
  }
  res.end();
}