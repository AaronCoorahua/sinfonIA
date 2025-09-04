import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SinfonIA",
  description:
    "Descubre una nueva forma de aprender a tocar instrumentos con SinfonIA. Convierte la práctica musical en un juego divertido y motivador con retos, canciones interactivas y progreso en tiempo real.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-[#0b0f1a] via-[#090b12] to-black text-white`}>
        {/* ======= HEADER ======= */}
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            {/* Logo / Nombre */}
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-wide text-white hover:text-blue-400 transition-colors">
              SinfonIA
            </Link>

            {/* Navegación */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/music-generator" className="text-sm text-gray-300 hover:text-white transition">
                Generar música
              </Link>
              <Link href="/practice" className="text-sm text-gray-300 hover:text-white transition">
                Canciones
              </Link>
              <Link href="/song" className="text-sm text-gray-300 hover:text-white transition">
                Practicar
              </Link>
              <Link href="/puntajes" className="text-sm text-gray-300 hover:text-white transition">
                Ranking
              </Link>
              <Link href="/select-instrument" className="text-sm text-gray-300 hover:text-white transition">
                Instrumentos
              </Link>
            </nav>

            {/* Botón login / CTA */}
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </header>

        {/* ======= CONTENIDO ======= */}
        <main className="pt-4">{children}</main>

        {/* ======= FOOTER SIMPLE ======= */}
        <footer className="mt-10 border-t border-white/10 bg-black/20 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} SinfonIA. Aprende música de forma divertida.
        </footer>
      </body>
    </html>
  );
}
