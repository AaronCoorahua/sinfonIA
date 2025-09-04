"use client"

import React, { useMemo, useState } from "react"

/* =========================
   Data (PNG en vez de SVG)
   ========================= */
const instruments = [
  { id: "guitar",  name: "Guitarra", src: "/guitarra.png"  },
  { id: "piano",   name: "Piano",    src: "/piano.png"   },
  { id: "trumpet", name: "Trompeta", src: "/trompeta.png" },
  { id: "sax",     name: "Saxofón",  src: "/saxofon.png"     },
  { id: "violin",  name: "Violín",   src: "/violin.png"  },
  { id: "flute",   name: "Flauta",   src: "/flauta.png"   },
]

/* =========================
   Page
   ========================= */
export default function SelectInstrumentPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Carrusel 3D
  const RADIUS = 280
  const STEP = 360 / instruments.length
  const rotation = useMemo(() => -selectedIndex * STEP, [selectedIndex, STEP])

  const goPrev = () => setSelectedIndex(i => (i - 1 + instruments.length) % instruments.length)
  const goNext = () => setSelectedIndex(i => (i + 1) % instruments.length)

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0a0d14] via-[#090b12] to-black relative overflow-hidden">
      {/* Ambient glow / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(40%_30%_at_100%_100%,rgba(16,185,129,0.10),transparent_60%)]" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Selecciona un instrumento</h1>
      </header>

      {/* Carrusel 3D */}
      <section className="relative z-10 flex items-center justify-center py-10">
        {/* Flecha Izquierda (más centrada) */}
        <button
          onClick={goPrev}
          className="absolute left-12 md:left-24 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
          aria-label="Anterior"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Escena */}
        <div className="relative w-[820px] max-w-[94vw] h-[380px] [perspective:1200px]">
          <div className="absolute inset-0 -z-10 blur-3xl bg-blue-500/5 rounded-full" />
          <div
            className="absolute inset-0 mx-auto [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateZ(-${RADIUS}px) rotateY(${rotation}deg)` }}
          >
            {instruments.map((item, i) => {
              const angle = i * STEP
              const isActive = i === selectedIndex
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedIndex(i)}
                  className={[
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "rounded-3xl border backdrop-blur-sm",
                    "transition-all duration-500 ease-out",
                    isActive
                      ? "border-blue-400/40 bg-white/[0.06] shadow-[0_0_30px_-10px_rgba(59,130,246,0.6)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  ].join(" ")}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                    width: isActive ? 260 : 220,
                    height: isActive ? 220 : 190,
                    filter: isActive ? "none" : "blur(0.4px)",
                    opacity: isActive ? 1 : 0.72,
                  }}
                  aria-pressed={isActive}
                >
                  <div className="flex flex-col items-center justify-center h-full px-6">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain"
                      loading="lazy"
                    />
                  </div>
                  {isActive && <div className="pointer-events-none absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Flecha Derecha (más centrada) */}
        <button
          onClick={goNext}
          className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
          aria-label="Siguiente"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Indicadores & selección */}
      <footer className="relative z-10 pb-12">
        <div className="mx-auto max-w-xl flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {instruments.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setSelectedIndex(i)}
                className={`h-2 rounded-full transition-all ${i === selectedIndex ? "w-8 bg-blue-500" : "w-2 bg-white/30 hover:bg-white/60"}`}
                aria-label={`Ir a ${it.name}`}
              />
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
            Seleccionado: <span className="font-semibold">{instruments[selectedIndex].name}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
