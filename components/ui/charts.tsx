"use client"

import { useRef, useEffect } from "react"
import { Chart, type ChartData, type ChartOptions, registerables } from "chart.js"

Chart.register(...registerables)

interface ChartProps {
  data: ChartData
  options?: ChartOptions
  height?: number
  width?: number
}

export function LineChart({ data, options = {}, height = 400, width }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Create new chart
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: "line",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          ...options,
        },
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, options])

  return (
    <div style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export function BarChart({ data, options = {}, height = 400, width }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Create new chart
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: "bar",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          ...options,
        },
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, options])

  return (
    <div style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

