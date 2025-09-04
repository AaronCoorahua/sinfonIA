"use client"

import React, { useEffect, useRef, useState } from "react"

/* =========================================================
   SongPage → solo visor MediaPipe (rostro/manos) con puntos
   - Rostro: verde
   - Mano izquierda: azul
   - Mano derecha: amarillo
   - Fondo: negro
   ========================================================= */
export default function SongPage() {
  return (
    <div className="min-h-screen w-full text-white bg-black relative overflow-hidden">
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="w-full flex items-center justify-center py-8 md:py-10">
          <div className="relative w-full max-w-[1000px] aspect-video rounded-xl border border-white/10 overflow-hidden">
            <VisionFaceHands />
          </div>
        </div>
      </main>
    </div>
  )
}

/* =========================================================
   Cámara + MediaPipe (Face + Hands) — Solo puntos
   ========================================================= */
function VisionFaceHands() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const faceRef = useRef(null)
  const handsRef = useRef(null)
  const initializedRef = useRef(false)
  const resizeObsRef = useRef(null)

  const [errorMsg, setErrorMsg] = useState("")

  // Colores y opciones
  const COLOR_FACE = "#22c55e"  // verde
  const COLOR_LEFT = "#60a5fa"  // azul
  const COLOR_RIGHT = "#facc15" // amarillo
  const DOT_R = 3.6
  const MIRROR = true           // espejar cámara frontal

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let stream
    let alive = true

    // URLs de WASM (jsDelivr) y modelos .task (Google Cloud Storage)
    const MP_VERSION = "0.10.12"
    const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`
    const MODEL_FACE = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
    const MODEL_HAND = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"

    const fitCanvas = () => {
      const c = canvasRef.current
      const wrap = c?.parentElement
      if (!c || !wrap) return
      const dpr = Math.min(2, window.devicePixelRatio || 1) // nitidez sin pasar de 2x
      const { width, height } = wrap.getBoundingClientRect()
      c.width = Math.max(640, Math.floor(width * dpr))
      c.height = Math.max(360, Math.floor(height * dpr))
      c.style.width = `${Math.floor(width)}px`
      c.style.height = `${Math.floor(height)}px`
    }

    const start = async () => {
      try {
        // 1) Solicitar cámara
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })

        const v = videoRef.current
        if (!v) return
        v.srcObject = stream
        v.playsInline = true
        v.muted = true

        // Esperar metadatos antes de play()
        await new Promise((res) => {
          v.onloadedmetadata = () => {
            v.play().catch(() => {}) // ignorar AutoplayPolicy en dev
            res()
          }
        })

        // 2) Preparar canvas y resize observer
        fitCanvas()
        resizeObsRef.current = new ResizeObserver(fitCanvas)
        resizeObsRef.current.observe(canvasRef.current.parentElement)

        // 3) Cargar MediaPipe de forma dinámica (evita SSR)
        const vision = await import("@mediapipe/tasks-vision")
        const { FilesetResolver, FaceLandmarker, HandLandmarker } = vision
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)

        faceRef.current = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_FACE },
          runningMode: "VIDEO",
          numFaces: 1,
        })

        handsRef.current = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_HAND },
          runningMode: "VIDEO",
          numHands: 2,
        })

        // 4) Bucle de dibujo
        const loop = () => {
          if (!alive) return
          const c = canvasRef.current
          const ctx = c?.getContext("2d")
          const v = videoRef.current
          if (!ctx || !v) return

          const now = performance.now()

          // Fondo negro
          ctx.save()
          ctx.clearRect(0, 0, c.width, c.height)
          ctx.fillStyle = "black"
          ctx.fillRect(0, 0, c.width, c.height)

          // Espejado (opcional)
          if (MIRROR) {
            ctx.translate(c.width, 0)
            ctx.scale(-1, 1)
          }

          // — Rostro —
          try {
            const face = faceRef.current?.detectForVideo(v, now)
            if (face?.faceLandmarks?.length) {
              ctx.fillStyle = COLOR_FACE
              const pts = face.faceLandmarks[0]
              for (let i = 0; i < pts.length; i++) {
                const p = pts[i]
                ctx.beginPath()
                ctx.arc(p.x * c.width, p.y * c.height, DOT_R, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          } catch {}

          // — Manos —
          try {
            const res = handsRef.current?.detectForVideo(v, now)
            if (res?.landmarks?.length) {
              for (let i = 0; i < res.landmarks.length; i++) {
                const handPts = res.landmarks[i]
                // handedness: "Left" | "Right"
                let color = COLOR_LEFT
                const hd = res.handednesses?.[i]?.[0]?.categoryName || ""
                if (hd.toLowerCase() === "right") color = COLOR_RIGHT
                else if (hd.toLowerCase() === "left") color = COLOR_LEFT

                ctx.fillStyle = color
                for (let j = 0; j < handPts.length; j++) {
                  const p = handPts[j]
                  ctx.beginPath()
                  ctx.arc(p.x * c.width, p.y * c.height, DOT_R + 0.4, 0, Math.PI * 2)
                  ctx.fill()
                }
              }
            }
          } catch {}

          ctx.restore()
          rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)
      } catch (err) {
        console.error(err)
        setErrorMsg("No se pudo acceder a la cámara o cargar los modelos.")
      }
    }

    start()

    // Limpieza
    return () => {
      alive = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (resizeObsRef.current) resizeObsRef.current.disconnect()
      try { faceRef.current?.close?.() } catch {}
      try { handsRef.current?.close?.() } catch {}
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  return (
    <div className="absolute inset-0 bg-black">
      {/* Video oculto: fuente de frames */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas donde dibujamos los puntos */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Error visible si algo falla */}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="text-sm text-red-300 bg-red-900/30 border border-red-400/30 px-4 py-3 rounded-xl">
            {errorMsg}
          </div>
        </div>
      )}
    </div>
  )
}
