'use client'

import { useEffect, useRef } from 'react'

interface GaugeChartProps {
  score: number
  targetScore: number
}

export default function GaugeChart({ score, targetScore }: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)

  function drawGauge(canvas: HTMLCanvasElement, current: number) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const cx = W / 2, cy = H - 10, r = 88, strokeW = 9

    const zones = [
      { from: 0,    to: 0.33, color: 'rgba(229, 72, 77,0.35)'   },
      { from: 0.33, to: 0.55, color: 'rgba(245, 166, 35,0.35)'  },
      { from: 0.55, to: 1,    color: 'rgba(23, 166, 115,0.35)'   },
    ]
    zones.forEach(({ from, to, color }) => {
      ctx.beginPath()
      ctx.arc(cx, cy, r, Math.PI + from * Math.PI, Math.PI + to * Math.PI)
      ctx.strokeStyle = color
      ctx.lineWidth = strokeW
      ctx.lineCap = 'butt'
      ctx.stroke()
    })

    const norm    = Math.max(0, Math.min(1, (current + 100) / 200))
    const fillEnd = Math.PI + norm * Math.PI
    const grad    = ctx.createLinearGradient(cx - r, cy, cx + r, cy)
    grad.addColorStop(0,    '#E5484D')
    grad.addColorStop(0.45, '#F5A623')
    grad.addColorStop(1,    '#17A673')
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI, fillEnd)
    ctx.strokeStyle = grad
    ctx.lineWidth   = strokeW
    ctx.lineCap     = 'round'
    ctx.stroke()

    const needleAngle = Math.PI + norm * Math.PI
    const nx = cx + (r - 2) * Math.cos(needleAngle)
    const ny = cy + (r - 2) * Math.sin(needleAngle)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(nx, ny)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth   = 2
    ctx.lineCap     = 'round'
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#333333'
    ctx.fill()

    ctx.fillStyle = 'rgba(242,242,247,0.35)'
    ctx.font      = '10px -apple-system, system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('-100', cx - r - 2, cy + 14)
    ctx.textAlign = 'right'
    ctx.fillText('+100', cx + r + 2, cy + 14)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGauge(canvas, 0)

    const duration = 800
    const t0 = performance.now()

    function animate(ts: number) {
      if (!canvas) return
      const elapsed = ts - t0
      const t       = Math.min(elapsed / duration, 1)
      const ease    = 1 - Math.pow(1 - t, 3)
      drawGauge(canvas, Math.round(targetScore * ease))
      if (t < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [targetScore])

  return <canvas ref={canvasRef} width={210} height={115} style={{ width: 210, height: 115 }} />
}
