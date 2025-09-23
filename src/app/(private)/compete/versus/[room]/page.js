import React from 'react';
import VersusRoom from '../../../../../components/competition/versus-room';

export default function VersusPage({ params }) {
  // params may be a Promise in this Next.js version; unwrap with React.use()
  const p = React.use ? React.use(params) : params;
  const roomId = p?.room;
  if (!roomId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="p-6 bg-white rounded shadow">Room ID inválido</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <VersusRoom roomId={roomId} />
    </main>
  );
}
