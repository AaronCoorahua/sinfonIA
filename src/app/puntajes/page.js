"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Trophy, Medal } from "lucide-react"

/* ===== Canciones ===== */
const SONGS = [
  { id: "jingle-bells", title: "Jingle Bells", maxScore: 3400 },
  { id: "thinking-prelude", title: "Thinking Prelude (tipo Ed Sheeran)", maxScore: 3000 },
  { id: "funk-tonight", title: "Funk Tonight (tipo Bruno Mars)", maxScore: 3200 },
]

/* ===== Datos base determinísticos (SIN Math.random en render) ===== */
const FIRST = ["Ana","Luis","Valeria","Bruno","Carla","Mario","Ivan","Ruth","Diana","Erick","Majo","Jose","Lucia","Pablo","Caro","Diego","Nadia","Sofia","Gabo","Daniel","Camila","Andrea","Gina","Rodolfo","Noelia","Patricio","Adriana","Hugo","Elena","Rafa","Sebastian","Maria","Rocio","Alonso","Natalia","Javier","Nicole","Gerson","Paola","Fabiola"]
const LAST  = ["Rojas","Garcia","Soto","Diaz","Vega","Leon","Paredes","Salas","Cruz","Navas","Torres","Molina","Ponce","Silva","Cordova","Ramos","Flores","Huaman","Reyes","Quispe","Medina","Valdivia","Mendoza","Carbajal","Romero","Lizarbe","Rivadeneyra","Palacios","Arroyo","Campos","Castaneda","Espinoza","Tello","Caceres","Delgado","CacedA","Gutierrez","Ugarte","Palomino","Vasquez"]

const slug = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").toLowerCase()

// PRNG determinístico
function makePRNG(seed) {
  let x = seed >>> 0
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 0x100000000)
}

// Fecha determinística: partimos de una fecha fija (evita SSR/CSR mismatch)
const FIXED_BASE_ISO = "2025-09-04" // yyyy-mm-dd
function isoMinusDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number)
  const base = Date.UTC(y, m - 1, d)
  const t = base - days * 86400000
  const dt = new Date(t)
  return dt.toISOString().slice(0, 10)
}
function formatDateShort(iso) {
  const [y, m, d] = iso.split("-").map(Number)
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${String(d).padStart(2,"0")} ${months[m-1]}`
}

function generateScores(maxScore, seed = 1) {
  const rnd = makePRNG(seed)
  const arr = Array.from({ length: 100 }).map((_, i) => {
    const fn = FIRST[Math.floor(rnd() * FIRST.length)]
    const ln = LAST[Math.floor(rnd() * LAST.length)]
    const user = `${fn} ${ln}`
    const email = `${slug(fn)}.${slug(ln)}@utec.edu.pe`

    // puntajes decrecientes con ruido determinístico
    const drop = Math.floor(i * (maxScore * 0.012))
    const noise = Math.floor(rnd() * 80)
    const score = Math.max(0, maxScore - drop - noise)

    // fecha: últimos 0..10 días, determinístico
    const dayOffset = Math.floor(rnd() * 11)
    const iso = isoMinusDays(FIXED_BASE_ISO, dayOffset)
    const dateShort = formatDateShort(iso)

    return { user, email, score, dateShort }
  })
  arr.sort((a, b) => b.score - a.score)
  return arr.map((r, i) => ({ ...r, rank: i + 1 }))
}

// dataset por canción
const DATASET = {
  "jingle-bells": generateScores(SONGS[0].maxScore, 11),
  "thinking-prelude": generateScores(SONGS[1].maxScore, 27),
  "funk-tonight": generateScores(SONGS[2].maxScore, 53),
}

/* ===== UI ===== */
function RankCell({ rank }) {
  if (rank === 1) return <span className="inline-flex items-center gap-1 text-amber-300 font-semibold"><Trophy className="w-4 h-4" />#1</span>
  if (rank === 2) return <span className="inline-flex items-center gap-1 text-gray-300"><Medal className="w-4 h-4" />#2</span>
  if (rank === 3) return <span className="inline-flex items-center gap-1 text-yellow-200"><Medal className="w-4 h-4" />#3</span>
  return <span className="text-gray-400">#{rank}</span>
}

function Row({ r, maxScore }) {
  const pct = Math.round((r.score / maxScore) * 100)
  return (
    <li className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center border-b border-white/5">
      <div className="col-span-1"><RankCell rank={r.rank} /></div>
      <div className="col-span-3">
        <div className="font-medium">{r.user}</div>
      </div>
      <div className="col-span-3 text-gray-300">{r.email}</div>
      <div className="col-span-2">
        <div className="font-semibold">{r.score.toLocaleString()}</div>
        <div className="text-[11px] text-gray-400">de {maxScore.toLocaleString()}</div>
      </div>
      <div className="col-span-2">
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="col-span-1 text-right text-sm text-gray-300">{r.dateShort}</div>
    </li>
  )
}

/* ===== Página ===== */
export default function PuntajesPage() {
  const [songId, setSongId] = useState(SONGS[0].id)

  const { rows, maxScore, title } = useMemo(() => {
    const song = SONGS.find(s => s.id === songId) || SONGS[0]
    const base = DATASET[song.id] || []
    return { rows: base, maxScore: song.maxScore, title: song.title }
  }, [songId])

  // duplicamos para loop infinito perfecto
  const loopRows = useMemo(() => [...rows, ...rows], [rows])

  // ===== Marquee controlado por JS: start paused -> acelera =====
  const ulRef = useRef(null)
  const wrapperRef = useRef(null)
  const lastT = useRef(0)
  const startT = useRef(0)
  const y = useRef(0)
  const halfHeight = useRef(0)
  const paused = useRef(true)

  // ajustes de animación
  const START_DELAY_MS = 800          // empieza pausado
  const ACCEL_DURATION_S = 6          // segundos hasta velocidad máxima
  const MAX_SPEED = 130               // px/s (velocidad final)

  useEffect(() => {
    const ul = ulRef.current
    if (!ul) return

    // medir altura total y mitad (porque hay 2 copias)
    const total = ul.scrollHeight
    halfHeight.current = total / 2

    // estado inicial
    y.current = 0
    ul.style.transform = `translateY(0px)`

    // arranque con delay
    const startTimer = setTimeout(() => {
      paused.current = false
      lastT.current = 0
      startT.current = 0
      requestAnimationFrame(tick)
    }, START_DELAY_MS)

    function tick(t) {
      if (!ulRef.current) return
      if (paused.current) {
        lastT.current = t
        requestAnimationFrame(tick)
        return
      }
      if (!lastT.current) lastT.current = t
      if (!startT.current) startT.current = t

      const dt = (t - lastT.current) / 1000
      const elapsed = (t - startT.current) / 1000
      lastT.current = t

      // ease-out hacia velocidad máxima
      const k = Math.min(1, Math.max(0, elapsed / ACCEL_DURATION_S))
      const easeOut = 1 - Math.pow(1 - k, 3)
      const speed = easeOut * MAX_SPEED

      y.current -= speed * dt

      // reset cuando pasamos una copia
      if (Math.abs(y.current) >= halfHeight.current) {
        y.current += halfHeight.current
      }

      ulRef.current.style.transform = `translateY(${y.current}px) translateZ(0)`
      requestAnimationFrame(tick)
    }

    const onEnter = () => { paused.current = true }
    const onLeave = () => {
      paused.current = false
      // reset lastT para que no pegue salto
      lastT.current = 0
    }

    const wrap = wrapperRef.current
    wrap?.addEventListener("mouseenter", onEnter)
    wrap?.addEventListener("mouseleave", onLeave)

    return () => {
      clearTimeout(startTimer)
      wrap?.removeEventListener("mouseenter", onEnter)
      wrap?.removeEventListener("mouseleave", onLeave)
    }
  }, [loopRows])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1a] via-[#090b12] to-black text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Ranking global</h1>
            <p className="text-sm text-gray-400 mt-1">
              Correos <span className="text-gray-200 font-medium">@utec.edu.pe</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={songId}
              onChange={(e) => setSongId(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/20"
            >
              {SONGS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              Máximo: <span className="font-semibold">{maxScore.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor tabla + marquee */}
      <main className="px-6 pb-16">
        <div className="max-w-7xl mx-auto rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          {/* Encabezado */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wide text-gray-400 border-b border-white/10">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Usuario</div>
            <div className="col-span-3">Correo</div>
            <div className="col-span-2">Puntaje</div>
            <div className="col-span-2">Progreso</div>
            <div className="col-span-1 text-right">Fecha</div>
          </div>

          {/* Marquee vertical controlado por JS */}
          <div ref={wrapperRef} className="relative h-[520px] overflow-hidden">
            <ul
              ref={ulRef}
              className="will-change-transform"
              style={{ transform: "translateY(0px)" }}
            >
              {loopRows.map((r, idx) => (
                <Row key={`${r.email}-${r.rank}-${idx}`} r={r} maxScore={maxScore} />
              ))}
            </ul>

            {/* Gradientes arriba/abajo */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#0b0f1a] to-transparent" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0b0f1a] to-transparent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 text-sm text-gray-400">
          <span className="text-gray-200 font-medium">{title}</span>.
          <span className="ml-2">Pasa el mouse para pausar.</span>
        </div>
      </main>
    </div>
  )
}
