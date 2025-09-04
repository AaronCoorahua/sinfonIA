"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"

/** ========= Hand Icon (Base) ========= */
function HandIcon({ active = [], glow = false }) {
  const stroke = "currentColor"
  const baseStroke = 1.6
  const isOn = (i) => active.includes(i)
  const onFill = glow ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.6)"
  const onStroke = glow ? "0.95" : "0.8"
  const offStroke = "0.35"

  return (
    <svg viewBox="0 0 80 80" width="80" height="80" className="text-white/90" aria-hidden="true">
      <rect x="0" y="0" width="80" height="80" rx="16" fill="rgba(255,255,255,0.04)" />
      <rect x="18" y="36" width="44" height="28" rx="10" fill="rgba(255,255,255,0.04)" stroke={stroke} strokeOpacity={offStroke} strokeWidth={baseStroke}/>
      <rect x="10" y="30" width="12" height="22" rx="5" fill={isOn(0) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(0) ? onStroke : offStroke} strokeWidth={baseStroke}/>
      <rect x="24" y="16" width="10" height="26" rx="5" fill={isOn(1) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(1) ? onStroke : offStroke} strokeWidth={baseStroke}/>
      <rect x="36" y="12" width="10" height="30" rx="5" fill={isOn(2) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(2) ? onStroke : offStroke} strokeWidth={baseStroke}/>
      <rect x="48" y="16" width="10" height="28" rx="5" fill={isOn(3) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(3) ? onStroke : offStroke} strokeWidth={baseStroke}/>
      <rect x="60" y="22" width="8" height="22" rx="5" fill={isOn(4) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(4) ? onStroke : offStroke} strokeWidth={baseStroke}/>
    </svg>
  )
}

/** Mapa de notas → dedos activos */
const NOTES = [
  { id: "do",  label: "Do",  active: [1],            desc: "Seña Do (índice)" },
  { id: "re",  label: "Re",  active: [1,2],          desc: "Seña Re (índice+medio)" },
  { id: "mi",  label: "Mi",  active: [1,2,3],        desc: "Seña Mi (índice+medio+anular)" },
  { id: "fa",  label: "Fa",  active: [1,2,3,4],      desc: "Seña Fa (índice+medio+anular+meñique)" },
  { id: "sol", label: "Sol", active: [0,1,2,3,4],    desc: "Seña Sol (todos los dedos)" },
  { id: "la",  label: "La",  active: [4],            desc: "Seña La (meñique)" },
  { id: "si",  label: "Si",  active: [0],            desc: "Seña Si (pulgar)" },
]

/** ===== Secuencia y tempo ===== */
const SEQ = ["do", "re", "mi", "fa", "sol", "la", "si", "sol", "fa", "mi", "re", "do"]
const STEP_MS = 700 // velocidad de avance

export default function MusicGeneratorPage() {
  const [step, setStep] = useState(0)
  const [playingId, setPlayingId] = useState(SEQ[0])
  const [burst, setBurst] = useState({
    key: 0,
    label: NOTES[0].label,
    x: 0,
    y: 0,
    rot: 0,
  })

  const timerRef = useRef(null)
  const canvasWrapRef = useRef(null)

  // Avance automático
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStep((s) => (s + 1) % SEQ.length)
    }, STEP_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  // Calcula una posición aleatoria alrededor del canvas central (izq o der)
  const computeBurstPosition = () => {
    const wrap = canvasWrapRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (!wrap) {
      // fallback: lados de viewport
      const side = Math.random() < 0.5 ? "left" : "right"
      const x = side === "left" ? 40 + Math.random() * 160 : vw - (40 + Math.random() * 160)
      const y = 100 + Math.random() * Math.max(100, vh - 200)
      const rot = (Math.random() * 16 - 8) * (side === "left" ? -1 : 1)
      return { x, y, rot }
    }

    const rect = wrap.getBoundingClientRect()
    const side = Math.random() < 0.5 ? "left" : "right"

    // margen fuera del canvas
    const xMinLeft = Math.max(20, rect.left - 240)
    const xMaxLeft = rect.left - 80
    const xMinRight = rect.right + 80
    const xMaxRight = Math.min(vw - 20, rect.right + 240)

    const yMin = Math.max(20, rect.top - 60)
    const yMax = Math.min(vh - 120, rect.bottom + 60)

    const x = side === "left"
      ? (xMinLeft + Math.random() * Math.max(20, xMaxLeft - xMinLeft))
      : (xMinRight + Math.random() * Math.max(20, xMaxRight - xMinRight))

    const y = yMin + Math.random() * Math.max(40, yMax - yMin)

    // Rotación leve hacia el lado elegido
    const rot = side === "left"
      ? -(8 + Math.random() * 12) // -8° a -20°
      :  (8 + Math.random() * 12) // 8° a 20°

    return { x, y, rot }
  }

  // Cuando cambia el paso, actualizar playing y disparar burst visual
  useEffect(() => {
    const currentId = SEQ[step]
    setPlayingId(currentId)
    const note = NOTES.find((n) => n.id === currentId)

    const { x, y, rot } = computeBurstPosition()
    setBurst((b) => ({
      key: b.key + 1,
      label: note?.label ?? "",
      x,
      y,
      rot,
    }))
  }, [step])

  const noteMap = useMemo(() => {
    const m = new Map()
    for (const n of NOTES) m.set(n.id, n)
    return m
  }, [])

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0a0d14] via-[#090b12] to-black relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(40%_30%_at_100%_100%,rgba(16,185,129,0.10),transparent_60%)]" />

      {/* Header con instrumento seleccionado */}
      <header className="relative z-10 px-6 pt-6 pb-2 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Generador musical</h1>
          {/* <p className="mt-1 text-xs md:text-sm text-gray-400">Secuencia automática alrededor del canvas</p> */}
        </div>

        <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <Image src="/piano.png" alt="Instrumento seleccionado" fill className="object-contain p-1" sizes="40px" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] text-gray-400">Instrumento</p>
            <p className="text-xs font-medium">Seleccionado</p>
          </div>
        </div>
      </header>

      {/* Canvas central 16:9 (1920x1080) */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="w-full flex items-center justify-center py-8 md:py-10">
          <div
            ref={canvasWrapRef}
            className="relative w-full max-w-[1000px] aspect-video rounded-xl border border-white/10 shadow-inner overflow-hidden"
            style={{ background: "#00FF00" }} // green screen
          >
            {/* Canvas real a 1920x1080 (escalado responsivo) */}
            <canvas
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full"
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </main>

      {/* Overlay del burst (nota grande con zoom + fade) en posiciones aleatorias alrededor del canvas */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          key={burst.key}
          className="absolute text-5xl md:text-6xl font-extrabold text-white/95 select-none [text-shadow:_0_6px_28px_rgba(59,130,246,0.5)] burst-pop"
          style={{
            top: `${burst.y}px`,
            left: `${burst.x}px`,
            transform: `rotate(${burst.rot}deg)`,
          }}
        >
          {burst.label}
        </div>
      </div>

      {/* Barra inferior fija con la grilla de notas */}
      <footer className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 md:py-4 bg-black/40 backdrop-blur-md border-t border-white/10">
          <section className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {NOTES.map((n) => {
              const isPlaying = n.id === playingId
              return (
                <div
                  key={n.id}
                  className={[
                    "group relative rounded-2xl border backdrop-blur-sm px-3 py-4 text-center transition-all duration-300",
                    isPlaying
                      ? "border-blue-400/60 bg-white/[0.10] shadow-[0_0_40px_-10px_rgba(59,130,246,0.8)] animate-[pulseSoft_900ms_ease-out]"
                      : "border-white/10 bg-white/[0.06] hover:border-white/20"
                  ].join(" ")}
                >
                  <div className="mx-auto flex items-center justify-center">
                    <HandIcon active={n.active} glow={isPlaying} />
                  </div>
                  <div className="mt-2">
                    <div className={`font-medium ${isPlaying ? "text-base" : "text-sm"}`}>{n.label}</div>
                    {/* <div className="mt-0.5 text-[10px] text-gray-400">{n.desc}</div> */}
                  </div>
                </div>
              )
            })}
          </section>
        </div>
      </footer>

      {/* Animaciones CSS */}
      <style jsx global>{`
        @keyframes popAndFade {
          0%   { transform: scale(0.6); opacity: 0; }
          40%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1.0); opacity: 0; }
        }
        .burst-pop {
          animation: popAndFade 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity;
        }
        @keyframes pulseSoft {
          0%   { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.45); }
          70%  { box-shadow: 0 0 32px 8px rgba(59, 130, 246, 0.15); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.0); }
        }
      `}</style>
    </div>
  )
}
