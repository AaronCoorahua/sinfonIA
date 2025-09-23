// app/blog/page.js
import Link from "next/link";
import { LogIn } from "lucide-react";

import Navbar from "../../../components/ui/navbar";
// Entries
import e0 from "../../../components/blog/entries/senas-mano-ia";
import e1 from "../../../components/blog/entries/modo-juego-beneficios";
import e2 from "../../../components/blog/entries/ranking-tiempo-real";
import e3 from "../../../components/blog/entries/primera-cancion-15-minutos";
import e4 from "../../../components/blog/entries/mediapipe-estabilidad-pose";
import e5 from "../../../components/blog/entries/metricas-progreso-usuario";
import e6 from "../../../components/blog/entries/ux-musica-principiantes";
import e7 from "../../../components/blog/entries/retos-cooperativos-duo";
import e8 from "../../../components/blog/entries/curva-dificultad-musical";
import e9 from "../../../components/blog/entries/privacidad-seguridad-sinfonia";

// Todas las entradas (puedes ordenar por fecha si quieres)
const posts = [e0, e1, e2, e3, e4, e5, e6, e7, e8, e9];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />

      {/* Glow sutil */}
      <div className="pointer-events-none absolute left-0 right-0 top-[-120px] h-[120vh] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(224,122,47,0.18),transparent_70%),radial-gradient(80%_60%_at_100%_100%,rgba(242,194,97,0.14),transparent_70%)]" />

      <section className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Blog
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Novedades, ideas y aprendizajes detrás de SinfonIA.
          </p>
        </header>

        {/* Grid estilo Edge: destacado + cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured && <FeaturedCard post={featured} />}

          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10 bg-black/20 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SinfonIA. Aprende música de forma
        divertida.
      </footer>
    </main>
  );
}

function FeaturedCard({ post }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/20 transition sm:col-span-2">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          {post.tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-black/50 backdrop-blur px-2 py-1 text-[11px] text-gray-200"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="p-5">
          <h2 className="text-xl md:text-2xl font-semibold">{post.title}</h2>
          <p className="mt-2 text-sm text-gray-300 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-3 text-xs text-gray-400">
            {formatDate(post.date)} · {post.readTime}
          </div>
        </div>
      </Link>
    </article>
  );
}

function BlogCard({ post }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/20 transition">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {post.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-black/50 backdrop-blur px-2 py-1 text-[11px] text-gray-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            {formatDate(post.date)} · {post.readTime}
          </div>
        </div>
      </Link>
    </article>
  );
}
