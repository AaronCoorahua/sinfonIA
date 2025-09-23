"use client";
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function VersusRoom({ roomId, initialPlayer }) {
  const [game, setGame] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const playerRef = useRef(initialPlayer || { id: uuidv4(), name: 'Jugador-' + Math.floor(Math.random() * 1000) });
  const router = useRouter();
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // connect to server (use the API route path)
    socketRef.current = io({ path: '/api/socket' });
    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { roomId, playerId: playerRef.current.id, playerName: playerRef.current.name });
    });
    socket.on('game-state', (g) => {
      console.debug('[socket] game-state', g);
      setGame(g);
    });
    socket.on('score-update', (g) => {
      console.debug('[socket] score-update', g);
      setGame(g);
    });
    socket.on('room-closed', () => {
      console.debug('[socket] room-closed');
      // server will delete room; navigate back to list
      router.push('/compete');
    });
    socket.on('room-full', () => alert('Sala llena'));

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // watch for finished state and start countdown
  useEffect(() => {
    if (!game) return;
    if (game.status === 'finished') {
      // ensure we have a finishAt; if server didn't provide one, use local 5s
      const finishAt = game.finishAt || (Date.now() + 5000);
      const update = () => {
        const remaining = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          router.push('/compete');
        }
      };

      update();
      const iv = setInterval(update, 250);
      return () => clearInterval(iv);
    }
  }, [game, router]);

  const handlePress = () => {
    if (!socketRef.current || !game) return;
    // require the game to be playing and at least 2 players, and that this client is a participant
    const meIndex = game.players.findIndex((p) => p.id === playerRef.current.id);
    if (game.status !== 'playing' || (game.players?.length || 0) < 2 || meIndex === -1) return;
    console.debug('[socket] emit press-button', { roomId, playerId: playerRef.current.id });
    socketRef.current.emit('press-button', { roomId, playerId: playerRef.current.id });
  };

  if (!game) {
    return (
      <div className="justify-center w-full max-w-2xl mx-auto p-6 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] rounded-lg shadow">
        <p>Conectando a la sala...</p>
      </div>
    );
  }

  const meIndex = game.players.findIndex((p) => p.id === playerRef.current.id);
  const opponentIndex = meIndex === 0 ? 1 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Versus — Sala {roomId}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-muted">Tú</div>
          <div className="font-bold text-2xl">{game.players[meIndex]?.name ?? 'Esperando...'}</div>
          <div className="text-4xl mt-2">{game.scores[meIndex] ?? 0}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-muted">Rival</div>
          <div className="font-bold text-2xl">{game.players[opponentIndex]?.name ?? 'Esperando...'}</div>
          <div className="text-4xl mt-2">{game.scores[opponentIndex] ?? 0}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePress}
          className="px-6 py-3 bg-[#e07a2f] text-white rounded shadow hover:brightness-105 disabled:opacity-50"
          disabled={game.status !== 'playing' || (game.players?.length || 0) < 2 || meIndex === -1}
        >
          Presiona
        </button>

        <div>
          Estado: <strong>{game.status}</strong>
          {game.status === 'finished' && (
            <div className="mt-2 text-green-600">
              {game.winner !== undefined && <div>Ganador: {game.players[game.winner]?.name}</div>}
              {countdown !== null && (
                <div className="mt-2">La sala cerrará en: {countdown}s</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
