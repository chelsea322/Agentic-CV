'use client'

import { useEffect, useRef } from 'react'

// A slow, dreamy aurora: a few huge soft orbs drifting on Lissajous paths,
// plus a sprinkle of twinkling stars. Rendered at reduced resolution, paused
// when hidden, frame-capped, and drawn once (static) under reduced motion.

type Orb = { x: number; y: number; r: number; sx: number; sy: number; px: number; py: number; hue: 0 | 1 | 2 }
type Star = { x: number; y: number; s: number; p: number; f: number }

const ORBS: Orb[] = [
  { x: 0.22, y: 0.28, r: 0.55, sx: 0.07, sy: 0.05, px: 0, py: 1.2, hue: 0 },
  { x: 0.78, y: 0.22, r: 0.5, sx: 0.05, sy: 0.08, px: 2.1, py: 0.4, hue: 1 },
  { x: 0.55, y: 0.78, r: 0.6, sx: 0.06, sy: 0.04, px: 4.0, py: 2.6, hue: 2 },
  { x: 0.9, y: 0.7, r: 0.4, sx: 0.04, sy: 0.07, px: 1.0, py: 3.3, hue: 0 },
]

function readPalette(el: HTMLElement) {
  const cs = getComputedStyle(el)
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  return {
    colors: [get('--glow-1', '124 92 255'), get('--glow-2', '240 120 200'), get('--glow-3', '70 200 220')],
    alpha: parseFloat(get('--glow-alpha', '0.34')),
    star: get('--star', '255 255 255'),
    starAlpha: parseFloat(get('--star-alpha', '0.8')),
    additive: get('--glow-blend', 'lighter') === 'lighter',
  }
}

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const small = window.matchMedia('(max-width: 640px)')
    let palette = readPalette(document.documentElement)
    let width = 0
    let height = 0
    let stars: Star[] = []
    let frame = 0
    let last = 0
    let running = false

    const resize = () => {
      // Quarter-ish resolution is plenty for blurry glows and saves battery.
      const scale = small.matches ? 0.3 : 0.4
      width = Math.max(1, Math.round(window.innerWidth * scale))
      height = Math.max(1, Math.round(window.innerHeight * scale))
      canvas.width = width
      canvas.height = height
      const count = small.matches ? 28 : 56
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 0.9 + 0.5,
        p: Math.random() * Math.PI * 2,
        f: Math.random() * 0.5 + 0.25,
      }))
      draw(performance.now())
    }

    const draw = (now: number) => {
      const t = motion.matches ? 0 : now / 1000
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = palette.additive ? 'lighter' : 'source-over'
      const base = Math.max(width, height)
      for (const o of ORBS) {
        const cx = (o.x + Math.sin(t * o.sx + o.px) * 0.14) * width
        const cy = (o.y + Math.cos(t * o.sy + o.py) * 0.12) * height
        const r = o.r * base * (1 + Math.sin(t * 0.1 + o.px) * 0.06)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        const c = palette.colors[o.hue]
        g.addColorStop(0, `rgb(${c} / ${palette.alpha})`)
        g.addColorStop(0.5, `rgb(${c} / ${palette.alpha * 0.35})`)
        g.addColorStop(1, `rgb(${c} / 0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }
      ctx.globalCompositeOperation = 'source-over'
      for (const s of stars) {
        const tw = motion.matches ? 0.7 : 0.55 + 0.45 * Math.sin(t * s.f + s.p)
        ctx.fillStyle = `rgb(${palette.star} / ${palette.starAlpha * tw})`
        ctx.fillRect(Math.floor(s.x * width), Math.floor(s.y * height), s.s, s.s)
      }
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - last < 1000 / 30) return // 30fps is plenty for slow drift
      last = now
      draw(now)
    }

    const start = () => {
      if (running || motion.matches || document.hidden) return
      running = true
      frame = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }
    const sync = () => {
      stop()
      resize()
      start()
    }

    const onVisibility = () => (document.hidden ? stop() : start())
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(document.documentElement)
      if (!running) draw(performance.now())
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(sync, 150)
    }

    sync()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', sync)
    return () => {
      stop()
      themeObserver.disconnect()
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', sync)
    }
  }, [])

  return <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />
}
