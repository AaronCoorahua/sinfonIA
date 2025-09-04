"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"

const SONGS = [
  // ——— Peruanas (4) ———
  {
    id: "1",
    title: "Cuando pienses en volver (Pedro Suárez-Vértiz)",
    author: "Comunidad",
    cover: "/cuandopienses.jpg",
    difficulty: "Media",
    durationSec: 210,
    createdAt: "2025-08-20",
    completedCount: 312,
    rating: 4.5,
    tags: ["Rock peruano", "Guitarra", "Groove"],
    completionRate: 0.71,
  },
  {
    id: "2",
    title: "Festejo Limeño (Eva Ayllón)",
    author: "Comunidad",
    cover: "/festejo.jpg",
    difficulty: "Difícil",
    durationSec: 238,
    createdAt: "2025-08-05",
    completedCount: 154,
    rating: 4.7,
    tags: ["Afroperuano", "Voz", "Percusión"],
    completionRate: 0.52,
  },
  {
    id: "3",
    title: "Intro al Do",
    author: "Equipo Edu",
    cover: "/introdo.png",
    difficulty: "Fácil",
    durationSec: 96,
    createdAt: "2025-08-29",
    completedCount: 689,
    rating: 4.2,
    tags: ["Principiantes", "Teoría", "Do"],
    completionRate: 0.9,
  },
  {
    id: "4",
    title: "Vals Criollo en Sol",
    author: "María Ríos",
    cover: "/vals.jpg",
    difficulty: "Media",
    durationSec: 185,
    createdAt: "2025-07-25",
    completedCount: 278,
    rating: 4.4,
    tags: ["Vals", "Guitarra", "Criollo"],
    completionRate: 0.66,
  },

  // ——— Pop / internacionales (4) ———
  {
    id: "5",
    title: "Perfect (Ed Sheeran)",
    author: "Studio Común",
    cover: "/perfect.jpg",
    difficulty: "Media",
    durationSec: 204,
    createdAt: "2025-08-18",
    completedCount: 421,
    rating: 4.6,
    tags: ["Pop", "Fingerstyle", "Guitarra"],
    completionRate: 0.75,
  },
  {
    id: "6",
    title: "Tiempo de Vals",
    author: "Cover colectivo",
    cover: "/vals.png",
    difficulty: "Fácil",
    durationSec: 199,
    createdAt: "2025-08-10",
    completedCount: 503,
    rating: 4.3,
    tags: ["Vals", "Bailable", "Pop latino"],
    completionRate: 0.83,
  },
  {
    id: "7",
    title: "Jingle Bells",
    author: "Comunidad",
    cover: "/jingle.webp",
    difficulty: "Fácil",
    durationSec: 140,
    createdAt: "2025-06-15",
    completedCount: 812,
    rating: 4.1,
    tags: ["Navidad", "Coro", "Fácil"],
    completionRate: 0.88,
  },
  {
    id: "8",
    title: "24K Magic (Bruno Mars)",
    author: "Leo Campos",
    cover: "/24k.jpg",
    difficulty: "Difícil",
    durationSec: 232,
    createdAt: "2025-07-30",
    completedCount: 201,
    rating: 4.8,
    tags: ["Funk", "Brass", "Groove"],
    completionRate: 0.58,
  },
]

const DIFF_COLORS = {
  "Fácil": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Media": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Difícil": "bg-rose-500/15 text-rose-300 border-rose-500/30",
}

function secondsToMinSec(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss.toString().padStart(2, "0")}`
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" })
}

function Stars({ value }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} de 5`}>
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} type="full" />)}
      {half && <Star type="half" />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} type="empty" />)}
      <span className="ml-1 text-xs text-gray-400">{value.toFixed(1)}</span>
    </div>
  )
}

function Star({ type }) {
  return (
    <span className="inline-block">
      <svg viewBox="0 0 24 24" width="16" height="16" className="text-yellow-400">
        {type === "full" && (
          <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        )}
        {type === "half" && (
          <>
            <defs>
              <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGrad)" stroke="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </>
        )}
        {type === "empty" && (
          <path fill="none" stroke="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        )}
      </svg>
    </span>
  )
}

export default function PracticePage() {
  const [query, setQuery] = useState("")
  const [diff, setDiff] = useState("Todas")
  const [sortKey, setSortKey] = useState("recientes")

  const filtered = useMemo(() => {
    let out = SONGS.filter(s => {
      const q = query.trim().toLowerCase()
      const passQuery =
        q.length === 0 ||
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      const passDiff = diff === "Todas" || s.difficulty === diff
      return passQuery && passDiff
    })

    out = out.sort((a, b) => {
      switch (sortKey) {
        case "rating":
          return b.rating - a.rating
        case "duracion":
          return a.durationSec - b.durationSec
        case "completados":
          return b.completedCount - a.completedCount
        case "recientes":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    return out
  }, [query, diff, sortKey])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1a] via-[#090b12] to-black text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Prácticas de la comunidad</h1>
            <p className="text-sm text-gray-400 mt-1">
              Explora canciones creadas por otros usuarios. Filtra por dificultad, ordena por rating o popularidad.
            </p>
          </div>

          {/* Controles */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, autor o tag…"
                className="w-full sm:w-[280px] rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-white/20"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
            </div>

            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/20"
            >
              <option value="Todas">Todas las dificultades</option>
              <option value="Fácil">Fácil</option>
              <option value="Media">Media</option>
              <option value="Difícil">Difícil</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/20"
            >
              <option value="recientes">Más recientes</option>
              <option value="rating">Mejor rating</option>
              <option value="duracion">Menor duración</option>
              <option value="completados">Más completadas</option>
            </select>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <article
              key={s.id}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.04] transition overflow-hidden
                         transform-gpu hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_12px_40px_-10px_rgba(59,130,246,0.45)]"
            >
              {/* Cover con zoom en hover */}
              <div className="relative h-40 w-full bg-white/[0.03] overflow-hidden">
                <Image
                  src={s.cover ?? "/prueba.png"}
                  alt={s.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:opacity-100 will-change-transform"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${DIFF_COLORS[s.difficulty]}`}>
                  {s.difficulty}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="text-lg font-medium leading-tight">{s.title}</h3>
                <p className="text-sm text-gray-400">por {s.author}</p>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[11px] rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-gray-300">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 p-2 text-center">
                    <div className="text-gray-400 text-[11px]">Duración</div>
                    <div className="font-medium">{secondsToMinSec(s.durationSec)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 p-2 text-center">
                    <div className="text-gray-400 text-[11px]">Fecha</div>
                    <div className="font-medium">{formatDate(s.createdAt)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 p-2 text-center">
                    <div className="text-gray-400 text-[11px]">Completado</div>
                    <div className="font-medium">{s.completedCount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Rating + progreso */}
                <div className="mt-4 flex items-center justify-between">
                  <Stars value={s.rating} />
                  <span className="text-xs text-gray-400">{Math.round(s.completionRate * 100)}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, s.completionRate * 100))}%` }}
                  />
                </div>

                {/* CTA */}
                <div className="mt-4 flex items-center justify-between">
                  <button className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 text-sm transition">
                    Practicar
                  </button>
                  <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm transition">
                    Detalles
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="max-w-7xl mx-auto text-center text-gray-400 mt-20">
            No se encontraron resultados. Prueba con otros filtros.
          </div>
        )}
      </main>
    </div>
  )
}
