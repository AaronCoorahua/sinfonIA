"use client"

import React, { useEffect, useRef, useState } from "react"
import { Share2, RotateCcw, LogOut, Trophy, X, Star } from "lucide-react"

/* ======= Ícono de mano (para las notas del carrusel) ======= */
function HandIcon({ active = [], size = 64 }) {
  const stroke = "currentColor"
  const baseStroke = 1.6
  const isOn = (i) => active.includes(i)
  const onFill = "rgba(59,130,246,0.75)"
  const onStroke = "0.85"
  const offStroke = "0.35"
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className="text-white/90" aria-hidden="true">
      <rect x="0" y="0" width="80" height="80" rx="16" fill="rgba(255,255,255,0.05)" />
      <rect x="18" y="36" width="44" height="28" rx="10" fill="rgba(255,255,255,0.04)" stroke={stroke} strokeOpacity={offStroke} strokeWidth={baseStroke} />
      <rect x="10" y="30" width="12" height="22" rx="5" fill={isOn(0) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(0) ? onStroke : offStroke} strokeWidth={baseStroke} />
      <rect x="24" y="16" width="10" height="26" rx="5" fill={isOn(1) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(1) ? onStroke : offStroke} strokeWidth={baseStroke} />
      <rect x="36" y="12" width="10" height="30" rx="5" fill={isOn(2) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(2) ? onStroke : offStroke} strokeWidth={baseStroke} />
      <rect x="48" y="16" width="10" height="28" rx="5" fill={isOn(3) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(3) ? onStroke : offStroke} strokeWidth={baseStroke} />
      <rect x="60" y="22" width="8" height="22" rx="5" fill={isOn(4) ? onFill : "transparent"} stroke={stroke} strokeOpacity={isOn(4) ? onStroke : offStroke} strokeWidth={baseStroke} />
    </svg>
  )
}

/* ======= Notas & secuencia (tu lógica de juego) ======= */
const NOTES = [
  { id: "do",  label: "Do",  active: [1] },
  { id: "re",  label: "Re",  active: [1,2] },
  { id: "mi",  label: "Mi",  active: [1,2,3] },
  { id: "fa",  label: "Fa",  active: [1,2,3,4] },
  { id: "sol", label: "Sol", active: [0,1,2,3,4] },
  { id: "la",  label: "La",  active: [4] },
  { id: "si",  label: "Si",  active: [0] },
]

/* Secuencia ampliada (34) */
const SEQ_IDS = [
  "mi","mi","mi",
  "mi","mi","mi",
  "mi","sol","do","re","mi",
  "fa","fa","fa",
  "mi","mi","mi",
  "re","re","re","mi","re","sol",
  "mi","mi","mi",
  "mi","mi","mi",
  "mi","sol","do","re","mi",
]
const MAX_SCORE = SEQ_IDS.length * 100

/* Config carrusel */
const SPEED_PX_S = 260
const SPACING_PX = 124
const HIT_X = 120
const NOTE_WIDTH = 90
const LANE_HEIGHT = 200

export default function SongPage() {
  /* ------ Estado del juego ------ */
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [floating, setFloating] = useState([])
  const [progress, setProgress] = useState(0) // 0..1

  /* ------ Carrusel refs ------ */
  const laneRef = useRef(null)
  const nodeRefs = useRef([])
  const rafRef = useRef(null)
  const lastTRef = useRef(0)
  const positionsRef = useRef([])
  const hitFlagsRef = useRef([])
  const nearFlagsRef = useRef([])
  const finishedRef = useRef(false)

  /* ------ MediaPipe refs ------ */
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const cameraInstanceRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const handsResultsRef = useRef(null)
  const faceResultsRef = useRef(null)
  const rafVisionRef = useRef(null)

  /* =========================
     Inicializa carrusel
     ========================= */
  useEffect(() => {
    initRun()
    const onResize = () => initRun()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initRun = () => {
    cancelAnimationFrame(rafRef.current)
    lastTRef.current = 0
    finishedRef.current = false
    setShowResults(false)
    setScore(0)
    setFloating([])
    setConfetti([])
    setProgress(0)

    const w = laneRef.current?.clientWidth ?? 0
    const base = w + 60
    positionsRef.current = SEQ_IDS.map((_, i) => base + i * SPACING_PX)
    hitFlagsRef.current = SEQ_IDS.map(() => false)
    nearFlagsRef.current = SEQ_IDS.map(() => false)
    nodeRefs.current = SEQ_IDS.map((_, i) => nodeRefs.current[i] || null)

    for (let i = 0; i < SEQ_IDS.length; i++) {
      const el = nodeRefs.current[i]
      if (el) el.style.transform = `translate3d(${positionsRef.current[i]}px, -50%, 0) scale(1)`
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  const loop = (t) => {
    if (!lastTRef.current) lastTRef.current = t
    const dt = (t - lastTRef.current) / 1000
    lastTRef.current = t

    let allGone = true

    for (let i = 0; i < SEQ_IDS.length; i++) {
      let x = positionsRef.current[i] - SPEED_PX_S * dt
      positionsRef.current[i] = x

      const el = nodeRefs.current[i]
      if (el) {
        const d = Math.abs(x - HIT_X)
        const scale = d < 90 ? 1.1 : 1
        el.style.transform = `translate3d(${x}px, -50%, 0) scale(${scale})`

        const near = d < 45
        if (near !== nearFlagsRef.current[i]) {
          nearFlagsRef.current[i] = near
          if (near) el.dataset.near = "1"
          else delete el.dataset.near
        }
      }

      if (!hitFlagsRef.current[i] && x <= HIT_X + 6) {
        hitFlagsRef.current[i] = true
        setScore((s) => s + 100)
        setFloating((b) => [...b, { key: `fx-${i}-${performance.now()}`, x: HIT_X + NOTE_WIDTH * 0.5, label: "+100" }])
        setTimeout(() => setFloating((b) => b.slice(1)), 800)
      }

      if (x > -140) allGone = false
    }

    if (allGone && !finishedRef.current) {
      finishedRef.current = true
      setTimeout(() => {
        setShowResults(true)
        spawnConfetti()
      }, 500)
      return
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    if (!showResults) return
    const target = Math.max(0, Math.min(1, score / MAX_SCORE))
    setProgress(0)
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setProgress(target))
      return () => cancelAnimationFrame(id2)
    })
    return () => cancelAnimationFrame(id1)
  }, [showResults, score])

  const spawnConfetti = () => {
    const pieces = Array.from({ length: 160 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      dur: 3 + Math.random() * 3,
      delay: Math.random() * 0.8,
      rot: (Math.random() * 360) | 0,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
    }))
    setConfetti(pieces)
  }

  const restart = () => initRun()
  const share = async () => {
    const text = `¡Mi puntaje fue ${score}/${MAX_SCORE} en el challenge de Jingle Bells!`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mi puntaje", text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`)
        alert("Copiado al portapapeles ✅")
      }
    } catch (_) {}
  }
  const exit = () => { if (typeof window !== "undefined") window.history.back() }

  /* =========================
     MediaPipe: video + puntos
     ========================= */
  useEffect(() => {
    let stopped = false
    let hands, faceMesh, CameraCtor

    const init = async () => {
      try {
        // Carga dinámica (evita problemas con SSR/Turbopack)
        const [{ Hands }, { FaceMesh }] = await Promise.all([
          import("@mediapipe/hands"),
          import("@mediapipe/face_mesh"),
        ])

        // camera_utils: intenta ESM, si no, UMD
        try {
          const mod = await import("@mediapipe/camera_utils")
          CameraCtor = mod.Camera
        } catch {
          await import("@mediapipe/camera_utils/camera_utils.js")
          CameraCtor = window.Camera
        }

        // Instancias con locateFile desde CDN (versiones estables)
        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        })
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        })
        hands.onResults((res) => {
          handsResultsRef.current = res
          drawOverlays()
        })

        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
        })
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })
        faceMesh.onResults((res) => {
          faceResultsRef.current = res
          drawOverlays()
        })

        // Inicia cámara con camera_utils
        const videoEl = videoRef.current
        const cam = new CameraCtor(videoEl, {
          onFrame: async () => {
            if (stopped) return
            // manda el mismo frame a ambos modelos
            await hands.send({ image: videoEl })
            await faceMesh.send({ image: videoEl })
          },
          width: 1280,
          height: 720,
        })
        cameraInstanceRef.current = cam
        await cam.start()
      } catch (err) {
        console.error("MediaPipe init error:", err)
        // Fallback: getUserMedia + bucle propio si falla camera_utils
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
          mediaStreamRef.current = stream
          const v = videoRef.current
          v.srcObject = stream
          await v.play()
          const loopVision = async () => {
            if (stopped) return
            if (v.readyState >= 2) {
              await hands.send({ image: v })
              await faceMesh.send({ image: v })
            }
            rafVisionRef.current = requestAnimationFrame(loopVision)
          }
          loopVision()
        } catch (e) {
          console.error("Fallback getUserMedia error:", e)
        }
      }
    }

    const drawOverlays = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height

      // Fondo negro
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, W, H)

      // Rostro (verde)
      const face = faceResultsRef.current
      if (face?.multiFaceLandmarks?.length) {
        ctx.fillStyle = "#22c55e" // verde
        const lm = face.multiFaceLandmarks[0]
        for (let i = 0; i < lm.length; i++) {
          const p = lm[i]
          const x = p.x * W
          const y = p.y * H
          ctx.beginPath()
          ctx.arc(x, y, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Manos (izq azul, der amarilla)
      const handsRes = handsResultsRef.current
      if (handsRes?.multiHandLandmarks?.length) {
        const list = handsRes.multiHandLandmarks
        const handed = handsRes.multiHandedness || []
        for (let i = 0; i < list.length; i++) {
          const lm = list[i]
          const label = handed[i]?.label || "" // "Left" | "Right"
          ctx.fillStyle = label === "Left" ? "#60a5fa" : "#fbbf24" // azul / amarillo
          for (let j = 0; j < lm.length; j++) {
            const p = lm[j]
            const x = p.x * W
            const y = p.y * H
            ctx.beginPath()
            ctx.arc(x, y, 3.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    init()

    return () => {
      stopped = true
      try {
        cameraInstanceRef.current?.stop?.()
      } catch {}
      if (rafVisionRef.current) cancelAnimationFrame(rafVisionRef.current)
      const stream = mediaStreamRef.current
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  /* ======= SVG anillo del modal ======= */
  const R = 56
  const CIRC = 2 * Math.PI * R
  const dash = Math.max(0, Math.min(CIRC, CIRC * (1 - progress)))

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0b0f1a] via-[#090b12] to-black relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(40%_30%_at_100%_100%,rgba(16,185,129,0.10),transparent_60%)]" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-2 max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Song • Jingle Bells</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
          Puntaje: <span className="font-semibold">{score}</span>
        </div>
      </header>

      {/* Área de cámara (negro + puntos) */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="w-full flex items-center justify-center py-6 md:py-8">
          <div className="relative w-full max-w-[900px] aspect-video rounded-xl border border-white/10 shadow-inner overflow-hidden" style={{ background: "black" }}>
            {/* video oculto (solo alimenta MediaPipe) */}
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            {/* canvas de puntos */}
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full"
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </main>

      {/* Carrusel inferior */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div
          ref={laneRef}
          className="relative w-full rounded-2xl border border-white/10 bg-white/[0.05] overflow-hidden"
          style={{ height: LANE_HEIGHT }}
        >
          <div className="absolute top-0 bottom-0 w-[4px] bg-blue-500/70" style={{ left: HIT_X }} />
          <div className="absolute bottom-2 left-[calc(120px-18px)] text-[10px] text-blue-300">HIT</div>

          <div className="absolute inset-0">
            {SEQ_IDS.map((id, i) => {
              const meta = NOTES.find(n => n.id === id) || { label: id, active: [] }
              return (
                <div
                  key={`${id}-${i}`}
                  ref={(el) => (nodeRefs.current[i] = el)}
                  className="noteItem absolute top-1/2 -translate-y-1/2"
                  style={{ transform: `translate3d(${(laneRef.current?.clientWidth || 0) + 60 + i * SPACING_PX}px, -50%, 0)` }}
                >
                  <div className="noteCard rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2 text-center w-[90px]">
                    <div className="flex flex-col items-center">
                      <HandIcon active={meta.active} size={60} />
                      <div className="mt-1 text-[11px] font-medium leading-none">{meta.label}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {floating.map((fx) => (
            <div
              key={fx.key}
              className="absolute text-emerald-300 font-semibold text-lg animate-floatUp"
              style={{ left: fx.x, bottom: LANE_HEIGHT / 2 - 20 }}
            >
              {fx.label}
            </div>
          ))}
        </div>
      </section>

      {/* Modal de resultados + confeti */}
      {showResults && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:pt-16">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {confetti.map((c) => (
              <span
                key={c.id}
                className="absolute confetti"
                style={{
                  left: `${c.left}vw`,
                  width: c.size,
                  height: c.size * 0.6,
                  background: c.color,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                  transform: `rotate(${c.rot}deg)`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 w-[90vw] max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.12] to-white/[0.06] shadow-2xl animate-modalBounce">
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="inline-flex items-center gap-2 text-lg font-semibold">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Resultado
              </div>
              <button onClick={() => setShowResults(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="mt-4 flex items-center justify-center">
                <div className="relative w-[160px] h-[160px]">
                  <svg viewBox="0 0 140 140" className="w-full h-full">
                    <circle cx="70" cy="70" r={56} stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" />
                    <circle
                      cx="70"
                      cy="70"
                      r={56}
                      stroke="url(#grad)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={CIRC}
                      strokeDashoffset={dash}
                      strokeLinecap="round"
                      style={{
                        transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)",
                        willChange: "stroke-dashoffset",
                      }}
                      transform="rotate(-90 70 70)"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-extrabold">{score}</div>
                    <div className="text-[11px] text-gray-300">de {MAX_SCORE}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3">
                {[0,1,2].map((i) => (
                  <Star
                    key={i}
                    className="w-7 h-7 text-yellow-400 star-pop"
                    style={{ animationDelay: `${200 + i * 180}ms` }}
                    fill="currentColor"
                  />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button onClick={share} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 transition">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Compartir</span>
                </button>
                <button onClick={restart} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 transition">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Reintentar</span>
                </button>
                <button onClick={exit} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 transition">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS extra */}
      <style jsx global>{`
        .noteItem { will-change: transform; }
        .noteItem[data-near="1"] .noteCard {
          border-color: rgba(96,165,250,0.6);
          background: rgba(59,130,246,0.12);
          box-shadow: 0 0 40px -10px rgba(59,130,246,0.8);
        }
        @keyframes floatUp {
          0% { transform: translateY(8px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(-28px); opacity: 0; }
        }
        .animate-floatUp { animation: floatUp 800ms ease-out forwards; }
        @keyframes modalBounceIn {
          0%   { transform: translateY(-120%) scale(0.96); opacity: 0; }
          60%  { transform: translateY(8%) scale(1.02); opacity: 1; }
          100% { transform: translateY(0%) scale(1); }
        }
        .animate-modalBounce { animation: modalBounceIn 700ms cubic-bezier(0.22,1,0.36,1); }
        @keyframes confettiFall {
          0%   { transform: translateY(-110vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(calc(100vh - 96px)) rotate(720deg); opacity: 1; }
        }
        .confetti {
          border-radius: 2px;
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          will-change: transform;
        }
        @keyframes starPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .star-pop { animation: starPop 500ms cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </div>
  )
}

const CONFETTI_COLORS = ["#fbbf24","#34d399","#60a5fa","#f472b6","#f87171","#a78bfa","#22d3ee"]
