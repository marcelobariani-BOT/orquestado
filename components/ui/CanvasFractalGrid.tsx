"use client"

// Fuente: https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/canvas-fractal-grid.tsx
// Adaptación mínima para dark background: canvas sin bg-gray-100, mixBlendMode "screen" en lugar de "multiply"

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useAnimation } from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) return defaultValue
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) return getMatches(query)
    return defaultValue
  })

  const handleChange = () => setMatches(getMatches(query))

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()
    matchMedia.addEventListener("change", handleChange)
    return () => matchMedia.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

interface GradientStop {
  color: string
  position: number
}

interface GradientType {
  stops: GradientStop[]
  centerX: number
  centerY: number
}

interface CanvasFractalGridProps {
  dotSize?: number
  dotSpacing?: number
  dotOpacity?: number
  gradientAnimationDuration?: number
  waveIntensity?: number
  waveRadius?: number
  gradients?: GradientType[]
  dotColor?: string
  glowColor?: string
  enableNoise?: boolean
  noiseOpacity?: number
  enableMouseGlow?: boolean
  initialPerformance?: "low" | "medium" | "high"
  enableGradient?: boolean
}

const NoiseSVG = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
))
NoiseSVG.displayName = "NoiseSVG"

const NoiseOverlay: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div className="absolute inset-0 h-full w-full mix-blend-overlay" style={{ opacity }}>
    <NoiseSVG />
  </div>
)

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (typeof window === "undefined") return
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return {
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
  }
}

const usePerformance = (initialPerformance: "low" | "medium" | "high" = "medium") => {
  const [performance, setPerformance] = useState(initialPerformance)
  const [fps, setFps] = useState(60)
  useEffect(() => {
    if (typeof window === "undefined") return
    let frameCount = 0
    let lastTime = globalThis.performance.now()
    let framerId: number
    const measureFps = (time: number) => {
      frameCount++
      if (time - lastTime > 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastTime)))
        frameCount = 0
        lastTime = time
      }
      framerId = requestAnimationFrame(measureFps)
    }
    framerId = requestAnimationFrame(measureFps)
    return () => cancelAnimationFrame(framerId)
  }, [])
  useEffect(() => {
    if (fps < 30 && performance !== "low") setPerformance("low")
    else if (fps >= 30 && fps < 50 && performance !== "medium") setPerformance("medium")
    else if (fps >= 50 && performance !== "high") setPerformance("high")
  }, [fps, performance])
  return { performance, fps }
}

const Gradient: React.FC<{ gradients: GradientType[]; animationDuration: number }> = React.memo(
  ({ gradients, animationDuration }) => {
    const controls = useAnimation()
    useEffect(() => {
      controls.start({
        background: gradients.map(
          (g) => `radial-gradient(circle at ${g.centerX}% ${g.centerY}%, ${g.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`
        ),
        transition: { duration: animationDuration, repeat: Infinity, repeatType: "reverse", ease: "linear" },
      })
    }, [controls, gradients, animationDuration])
    return <motion.div className="absolute inset-0 h-full w-full" animate={controls} />
  }
)
Gradient.displayName = "Gradient"

const DotCanvas: React.FC<{
  dotSize: number
  dotSpacing: number
  dotOpacity: number
  waveIntensity: number
  waveRadius: number
  dotColor: string
  glowColor: string
  performance: "low" | "medium" | "high"
  mousePos: { x: number; y: number }
}> = React.memo(({ dotSize, dotSpacing, dotOpacity, waveIntensity, waveRadius, dotColor, glowColor, performance, mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const drawDots = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const { width, height } = ctx.canvas
      ctx.clearRect(0, 0, width, height)
      const skip = { low: 3, medium: 2, high: 1 }[performance]
      const cols = Math.ceil(width / dotSpacing)
      const rows = Math.ceil(height / dotSpacing)
      const centerX = mousePos.x * width
      const centerY = mousePos.y * height
      for (let i = 0; i < cols; i += skip) {
        for (let j = 0; j < rows; j += skip) {
          const x = i * dotSpacing
          const y = j * dotSpacing
          const distanceX = x - centerX
          const distanceY = y - centerY
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
          let dotX = x
          let dotY = y
          if (distance < waveRadius) {
            const waveStrength = Math.pow(1 - distance / waveRadius, 2)
            const angle = Math.atan2(distanceY, distanceX)
            const waveOffset = Math.sin(distance * 0.05 - time * 0.005) * waveIntensity * waveStrength
            dotX += Math.cos(angle) * waveOffset
            dotY += Math.sin(angle) * waveOffset
            const glowRadius = dotSize * (1 + waveStrength)
            const gradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, glowRadius)
            gradient.addColorStop(0, glowColor.replace("1)", `${dotOpacity * (1 + waveStrength)})`))
            gradient.addColorStop(1, glowColor.replace("1)", "0)"))
            ctx.fillStyle = gradient
          } else {
            ctx.fillStyle = dotColor.replace("1)", `${dotOpacity})`)
          }
          ctx.beginPath()
          ctx.arc(dotX, dotY, dotSize / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    [dotSize, dotSpacing, dotOpacity, waveIntensity, waveRadius, dotColor, glowColor, performance, mousePos]
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    let lastTime = 0
    const animate = (time: number) => {
      if (time - lastTime > 16) {
        drawDots(ctx, time)
        lastTime = time
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [drawDots])

  return (
    <canvas
      ref={canvasRef}
      // Adaptación dark mode: sin bg-gray-100, mixBlendMode "screen" en lugar de "multiply"
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  )
})
DotCanvas.displayName = "DotCanvas"

const MouseGlow: React.FC<{ glowColor: string; mousePos: { x: number; y: number } }> = React.memo(
  ({ glowColor, mousePos }) => (
    <>
      <div
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor.replace("1)", "0.15)")} 0%, ${glowColor.replace("1)", "0)")} 70%)`,
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: "translate(-50%, -50%)",
          filter: "blur(10px)",
        }}
      />
      <div
        className="absolute w-20 h-20 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor.replace("1)", "0.3)")} 0%, ${glowColor.replace("1)", "0)")} 70%)`,
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  )
)
MouseGlow.displayName = "MouseGlow"

const defaultGradients: GradientType[] = [
  { stops: [{ color: "#FFD6A5", position: 0 }, { color: "#FFADAD", position: 25 }, { color: "#FFC6FF", position: 50 }, { color: "transparent", position: 75 }], centerX: 50, centerY: 50 },
  { stops: [{ color: "#A0C4FF", position: 0 }, { color: "#BDB2FF", position: 25 }, { color: "#CAFFBF", position: 50 }, { color: "transparent", position: 75 }], centerX: 60, centerY: 40 },
  { stops: [{ color: "#9BF6FF", position: 0 }, { color: "#FDFFB6", position: 25 }, { color: "#FFAFCC", position: 50 }, { color: "transparent", position: 75 }], centerX: 40, centerY: 60 },
]

export function CanvasFractalGrid({
  dotSize = 4,
  dotSpacing = 20,
  dotOpacity = 0.3,
  gradientAnimationDuration = 20,
  waveIntensity = 30,
  waveRadius = 200,
  gradients = defaultGradients,
  dotColor = "rgba(100, 100, 255, 1)",
  glowColor = "rgba(100, 100, 255, 1)",
  enableNoise = true,
  noiseOpacity = 0.03,
  enableMouseGlow = true,
  initialPerformance = "medium",
  enableGradient = false,
}: CanvasFractalGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile, isTablet } = useResponsive()
  const { performance } = usePerformance(initialPerformance)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const { clientX, clientY } = event
    const { left, top, width, height } = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }
    setMousePos({ x: (clientX - left) / width, y: (clientY - top) / height })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  const responsiveDotSize = useMemo(() => {
    if (isMobile) return dotSize * 0.75
    if (isTablet) return dotSize * 0.9
    return dotSize
  }, [isMobile, isTablet, dotSize])

  const responsiveDotSpacing = useMemo(() => {
    if (isMobile) return dotSpacing * 1.5
    if (isTablet) return dotSpacing * 1.25
    return dotSpacing
  }, [isMobile, isTablet, dotSpacing])

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        key="canvas-fractal-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 overflow-hidden w-full h-full"
      >
        {enableGradient && <Gradient gradients={gradients} animationDuration={gradientAnimationDuration} />}
        <DotCanvas
          dotSize={responsiveDotSize}
          dotSpacing={responsiveDotSpacing}
          dotOpacity={dotOpacity}
          waveIntensity={waveIntensity}
          waveRadius={waveRadius}
          dotColor={dotColor}
          glowColor={glowColor}
          performance={performance}
          mousePos={mousePos}
        />
        {enableNoise && <NoiseOverlay opacity={noiseOpacity} />}
        {enableMouseGlow && <MouseGlow glowColor={glowColor} mousePos={mousePos} />}
      </motion.div>
    </AnimatePresence>
  )
}

export default React.memo(CanvasFractalGrid)
