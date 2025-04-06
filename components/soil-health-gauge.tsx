"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface SoilHealthGaugeProps {
  prediction: any
}

export default function SoilHealthGauge({ prediction }: SoilHealthGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Calculate health score based on soil parameters
  const calculateHealthScore = () => {
    const moisture = prediction.Moist
    const ph = prediction.Ph
    const nitro = prediction["Nitro (mg/10 g)"]
    const ec = prediction["EC (u/10 gram)"]

    // Normalize each parameter to a 0-1 scale
    const moistureScore = Math.min(Math.max((moisture - 10) / 50, 0), 1)
    const phScore = 1 - Math.abs(ph - 6.5) / 3.5
    const nitroScore = Math.min(nitro / 50, 1)
    const ecScore = 1 - Math.min(Math.max(Math.abs(ec - 800) / 800, 0), 1)

    // Weighted average
    return (moistureScore * 0.3 + phScore * 0.3 + nitroScore * 0.2 + ecScore * 0.2) * 100
  }

  const healthScore = calculateHealthScore()

  useEffect(() => {
    if (!svgRef.current) return

    const width = 300
    const height = 200
    const margin = 30
    const radius = Math.min(width, height * 2) / 2 - margin

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height})`)

    // Create scale
    const scale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([-Math.PI / 2, Math.PI / 2])
      .clamp(true)

    // Create color scale
    const colorScale = d3.scaleThreshold<number, string>().domain([40, 70]).range(["#ef4444", "#f97316", "#22c55e"])

    // Create arc generator
    const arc = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)

    // Background arc
    svg
      .append("path")
      .datum({ endAngle: Math.PI / 2 })
      .style("fill", "#e5e7eb")
      .attr("d", arc as any)

    // Add colored arcs for different ranges
    const arcPoor = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(scale(40) as number)

    const arcModerate = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(scale(40) as number)
      .endAngle(scale(70) as number)

    const arcGood = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(scale(70) as number)
      .endAngle(Math.PI / 2)

    svg
      .append("path")
      .style("fill", "#ef4444")
      .attr("d", arcPoor as any)

    svg
      .append("path")
      .style("fill", "#f97316")
      .attr("d", arcModerate as any)

    svg
      .append("path")
      .style("fill", "#22c55e")
      .attr("d", arcGood as any)

    // Add needle
    const needleLength = radius * 0.8
    const needleRadius = 10
    const needleAngle = scale(healthScore)

    const needleLine = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])

    const needle = [
      [0, -needleRadius / 2],
      [needleLength, 0],
      [0, needleRadius / 2],
      [0, -needleRadius / 2],
    ]

    svg
      .append("path")
      .data([needle])
      .attr("d", needleLine as any)
      .attr("transform", `rotate(${(needleAngle * 180) / Math.PI})`)
      .style("fill", colorScale(healthScore))

    // Add needle center circle
    svg.append("circle").attr("cx", 0).attr("cy", 0).attr("r", needleRadius).style("fill", "#374151")

    // Add score text
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -radius / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", colorScale(healthScore))
      .text(`${Math.round(healthScore)}`)

    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -radius / 2 + 25)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#4b5563")
      .text("Health Score")

    // Add labels
    svg
      .append("text")
      .attr("x", -radius * 0.6)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#4b5563")
      .text("0")

    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -radius * 0.1)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#4b5563")
      .text("50")

    svg
      .append("text")
      .attr("x", radius * 0.6)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#4b5563")
      .text("100")
  }, [healthScore])

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width={300} height={200}></svg>
      <div className="flex justify-between w-full mt-4 px-8">
        <div className="text-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mx-auto"></div>
          <p className="text-xs mt-1">Poor</p>
        </div>
        <div className="text-center">
          <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto"></div>
          <p className="text-xs mt-1">Moderate</p>
        </div>
        <div className="text-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
          <p className="text-xs mt-1">Good</p>
        </div>
      </div>
    </div>
  )
}

