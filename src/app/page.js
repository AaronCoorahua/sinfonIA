import Link from "next/link";
import { Music, Sparkles, Trophy, Gamepad2, Guitar, Hand, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Glow de fondo */}
      <div className="pointer-events-none absolute left-0 right-0 top-[-120px] h-[120vh] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(59,130,246,0.2),transparent_70%),radial-gradient(80%_60%_at_100%_100%,rgba(16,185,129,0.15),transparent_70%)]" />

      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
        {/* HERO */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Aprende jugando
          </div>

          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Aprender un instrumento, <span className="text-blue-400">por fin es divertido.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-gray-300">
            Selecciona tu instrumento favorito, sigue señas intuitivas y supera retos. 
            Gana puntos, desbloquea logros y compite en el ranking con la comunidad.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-medium transition"
            >
              <Music className="w-4 h-4" />
              Empezar a practicar
            </Link>
            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm transition"
            >
              Ver ranking
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mini-métricas */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              +100 prácticas de la comunidad
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Retos con puntaje en vivo
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Señas simples para empezar hoy
            </span>
          </div>
        </div>

        {/* VIDEO PRESENTACIÓN */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-black">
            <video
              src="/video.mp4"
              controls
              autoPlay
              loop
              muted
              className="w-full h-auto object-cover"
              poster="/video-poster.jpg"
              style={{ aspectRatio: "16/9" }}
            />
            {/* Overlay moderno opcional */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Hand className="w-6 h-6" />}
            title="Señas claras"
            desc="Aprende posiciones de dedos fáciles de recordar. Ideal para comenzar sin experiencia."
          />
          <FeatureCard
            icon={<Gamepad2 className="w-6 h-6" />}
            title="Modo juego"
            desc="Notas en carrusel, combos y feedback inmediato. Practicar se siente como jugar."
          />
          <FeatureCard
            icon={<Trophy className="w-6 h-6" />}
            title="Progreso y ranking"
            desc="Sigue tu avance, compara puntajes y sube posiciones en el ranking global."
          />
        </div>

        {/* GIFS CENTRADOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 mb-10 justify-items-center">
          <img src="/gif1.gif" alt="Gif 1" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
          <img src="/gif2.gif" alt="Gif 2" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
          <img src="/gif3.gif" alt="Gif 3" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
          <img src="/gif4.gif" alt="Gif 4" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
          <img src="/gif5.gif" alt="Gif 5" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
        </div>
        {/* PREVIEW RÁPIDA */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Explora canciones</h2>
            <Link
              href="/songs"
              className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PreviewCard title="Jingle Bells" tag="Fácil" icon={<Guitar className="w-5 h-5" />} />
            <PreviewCard title="Perfect (Ed Sheeran)" tag="Media" icon={<Music className="w-5 h-5" />} />
            <PreviewCard title="24K Magic" tag="Difícil" icon={<Music className="w-5 h-5" />} />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Subcomponentes ---------- */

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:shadow-[0_12px_40px_-10px_rgba(59,130,246,0.35)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-300">{desc}</p>
    </div>
  );
}

function PreviewCard({ title, tag, icon }) {
  return (
    <Link
      href="/songs"
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 transition hover:border-white/20"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -inset-20 bg-[conic-gradient(at_top_left,_rgba(59,130,246,0.25),transparent_35%,transparent)] blur-2xl" />
      </div>
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{title}</div>
          <div className="text-xs text-gray-400">{tag}</div>
        </div>
        <ChevronRight className="ml-auto w-4 h-4 text-gray-400 group-hover:text-white transition" />
      </div>
    </Link>
  );
}
