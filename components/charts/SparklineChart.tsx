'use client'

import { useEffect, useRef } from 'react'

interface SparklineChartProps {
  data: number[]
}

export default function SparklineChart({ data }: SparklineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    if (!ctx)  return
    const W    = canvas.width
    const H    = canvas.height
    const pad  = 4
    const min  = Math.min(...data)
    const max  = Math.max(...data)
    const range = max - min || 1

    const xFn = (i: number) => pad + (i * (W - pad * 2)) / (data.length - 1)
    const yFn = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2)

    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, '#0B4A8B')
    grad.addColorStop(1, '#0B4A8B')

    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    data.forEach((v, i) => {
      if (i === 0) ctx.moveTo(xFn(i), yFn(v))
      else ctx.lineTo(xFn(i), yFn(v))
    })
    ctx.strokeStyle = grad
    ctx.lineWidth   = 1.5
    ctx.lineJoin    = 'round'
    ctx.stroke()
  }, [data])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={44}
      style={{ width: '100%', height: 44 }}
    />
  )
}
