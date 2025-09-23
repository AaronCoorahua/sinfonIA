import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SinfonIA" className="h-8 w-8" />
          <span className="text-xl font-bold text-white">SinfonIA</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Inicio
          </Link>
          <Link
            href="/blog"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Blog
          </Link>
          <Link
            href="/about-us"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Sobre Nosotros
          </Link>
        </div>

        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E07A2F] hover:bg-[#C96524] px-5 py-3 text-sm font-medium text-white transition"
        >
          Iniciar Sesión
          <LogIn className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
