"use client";

import React, { useState } from "react";
import { Settings, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function CompetitionForm() {
  const [roomId, setRoomId] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  function generateRoomCode(len = 6) {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
  }

  function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    // generate a room code and navigate to the versus page which will open socket
    const newRoom = generateRoomCode(6);
    setTimeout(() => {
      setCreating(false);
      router.push(`/compete/versus/${newRoom}`);
    }, 250);
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!roomId.trim()) {
      alert("Por favor ingresa el ID de la sala");
      return;
    }
    // navigate to the versus room page which will join the socket
    router.push(`/compete/versus/${roomId.trim()}`);
  }

  return (
    <section
      aria-labelledby="competition-title"
      className="w-full text-[color:var(--color-foreground)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Left: Versus mode */}
        <div className="p-6 rounded-lg border border-gray-200 bg-[color:var(--color-background)] shadow-sm">
          <h3 className="text-xl font-semibold mb-4">⚔️ Modo Versus</h3>

          <form onSubmit={handleCreate} aria-label="Crear sala">
            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#e07a2f",
                  boxShadow: "0 0 0 4px rgba(224,122,47,0.14)",
                }}
                aria-disabled={creating}
              >
                {creating ? "Creando..." : "Crear sala"}
              </button>

              <button
                type="button"
                onClick={() => {
                  // config button placeholder
                  alert("Abrir configuración (simulada)");
                }}
                title="Configuración"
                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 transition-colors duration-150"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Versus image */}

          <hr className="my-6" />

          <form onSubmit={handleJoin} aria-label="Unirse a sala">
            <label
              htmlFor="room-id"
              className="block text-sm font-medium text-white mb-5"
            >
              Unirse a sala
            </label>
            <div className="mt-1 flex gap-2 mb-2">
              <input
                id="room-id"
                name="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="block w-full rounded-md shadow-sm focus:ring-2 pl-4"
                style={{ borderWidth: "2px", borderColor: "#e07a2f" }}
                placeholder="ID de la sala (ej. ROOM1234)"
                type="text"
                aria-required="true"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 pb-2 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#e07a2f",
                  boxShadow: "0 0 0 4px rgba(224,122,47,0.14)",
                }}
              >
                Unirse
              </button>
            </div>
          </form>
          <div className="mt-6">
            <img
              src="/competition/versus.webp"
              alt="Versus"
              className="w-full rounded-md"
            />
          </div>
        </div>

        {/* Right: Carrera mode - Coming Soon in grayscale */}
        <div
          className="relative p-6 rounded-lg border border-gray-200 bg-[color:var(--color-background)] shadow-sm filter grayscale overflow-hidden"
          aria-hidden="false"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🏅 Modo Carrera</h3>
            <span className="text-sm font-medium text-gray-500">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-gray-300 p-3 bg-[color:var(--color-background)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nivel 1</p>
                  <p className="text-xs text-gray-500">
                    Principiante — desbloquea más niveles al progresar
                  </p>
                </div>
                <div className="text-sm text-gray-400">●●●</div>
              </div>
            </div>

            <div className="rounded-md border border-gray-300 p-3 bg-[color:var(--color-background)] opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nivel 2</p>
                </div>
                <div className="text-sm text-gray-400">●●●</div>
              </div>
            </div>

            <div className="rounded-md border border-gray-300 p-3 bg-[color:var(--color-background)] opacity-40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nivel 3</p>
                </div>
                <div className="text-sm text-gray-400">●●●</div>
              </div>
            </div>
          </div>

          {/* Ladder image */}
          <div className="mt-6">
            <img
              src="/competition/lader.webp"
              alt="Ladder"
              className="w-full rounded-md opacity-60"
            />
          </div>

          {/* Large coming soon overlay */}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
            <Lock className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-red-500 tracking-wide">
                COMING SOON
              </h4>
              <p className="mt-2 text-sm text-red-300">
                Modo Carrera — en desarrollo
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
