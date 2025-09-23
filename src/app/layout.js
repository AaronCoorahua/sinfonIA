import { Geist, Geist_Mono } from "next/font/google";
import "@aws-amplify/ui-react/styles.css";
import "./globals.css";
import AmplifyProvider from "./AmplifyProvider";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-[#0b0f1a] via-[#090b12] to-black text-white`}
      >
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
