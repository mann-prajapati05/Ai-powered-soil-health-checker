import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import { writeFile, mkdir, readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import path from "path"

// Create a temporary directory for uploads if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), "uploads")
const OUTPUT_DIR = path.join(process.cwd(), "soil_analysis_output")

export async function POST(request: NextRequest) {
  try {
    // Ensure directories exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true })
    }

    // Get form data from request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Save the uploaded file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(UPLOAD_DIR, "soildata.csv")
    await writeFile(filePath, buffer)

    // Run the Python model script
    const modelOutput = await runPythonModel()

    // Read the predictions file
    const predictionsPath = join(OUTPUT_DIR, "soil_predictions.csv")
    let predictions

    try {
      const predictionsData = await readFile(predictionsPath, "utf8")
      predictions = parseCSV(predictionsData)
    } catch (error) {
      console.error("Error reading predictions file:", error)
      return NextResponse.json(
        {
          error: "Failed to read model predictions",
          modelOutput,
        },
        { status: 500 },
      )
    }

    // Extract model metrics from the output
    const metrics = extractModelMetrics(modelOutput)

    return NextResponse.json({
      success: true,
      predictions,
      metrics,
      modelOutput,
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function runPythonModel(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    const scriptPath = join(process.cwd(), "model.py")

    // Spawn Python process
    const pythonProcess = spawn("python", [scriptPath])

    let outputData = ""
    let errorData = ""

    // Collect data from stdout
    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString()
    })

    // Collect data from stderr
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString()
    })

    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`)
        console.error("Error output:", errorData)
        reject(`Python process failed with code ${code}: ${errorData}`)
      } else {
        resolve(outputData)
      }
    })

    // Handle process errors
    pythonProcess.on("error", (error) => {
      reject(`Failed to start Python process: ${error.message}`)
    })
  })
}

function parseCSV(csvData: string): any[] {
  const lines = csvData.trim().split("\n")
  const headers = lines[0].split(",")

  return lines.slice(1).map((line) => {
    const values = line.split(",")
    const row: Record<string, string | number> = {}

    headers.forEach((header, index) => {
      const value = values[index]
      // Convert numeric values
      row[header] = isNaN(Number(value)) ? value : Number(value)
    })

    return row
  })
}

function extractModelMetrics(output: string): any {
  // Initialize metrics object
  const metrics = {
    r2Scores: {} as Record<string, number>,
    rmseScores: {} as Record<string, number>,
    mseScores: {} as Record<string, number>,
    bestModels: {} as Record<string, string>,
    bestFeatures: {} as Record<string, string[]>,
  }

  // Extract R2, RMSE, MAE values for each target
  const finalSummaryMatch = output.match(/=== Final Summary ===([\s\S]*?)(?=\n\nGenerating predictions|$)/)

  if (finalSummaryMatch) {
    const summaryText = finalSummaryMatch[1]
    const targetBlocks = summaryText.split("\nTarget:")

    targetBlocks.slice(1).forEach((block) => {
      const targetMatch = block.match(/^(.*?)\n/)
      if (!targetMatch) return

      const target = targetMatch[1].trim()

      // Extract model type
      const modelMatch = block.match(/Best model: (.*?)(?:\n|$)/)
      if (modelMatch) {
        metrics.bestModels[target] = modelMatch[1].replace("Regressor", "").trim()
      }

      // Extract R2
      const r2Match = block.match(/R2: ([\d.]+)/)
      if (r2Match) {
        metrics.r2Scores[target] = Number.parseFloat(r2Match[1])
      }

      // Extract RMSE
      const rmseMatch = block.match(/RMSE: ([\d.]+)/)
      if (rmseMatch) {
        metrics.rmseScores[target] = Number.parseFloat(rmseMatch[1])
      }

      // Calculate MSE from RMSE
      if (metrics.rmseScores[target]) {
        metrics.mseScores[target] = Math.pow(metrics.rmseScores[target], 2)
      }
    })
  }

  // Extract feature information
  const featureSelectionMatches = output.matchAll(/Selected (\d+) features for (.*?)\n/g)
  for (const match of featureSelectionMatches) {
    const target = match[2].trim()
    // Since we don't have the actual feature names in the output, we'll use placeholder names
    // In a real implementation, you'd extract the actual feature names
    metrics.bestFeatures[target] = Array(Number.parseInt(match[1]))
      .fill(0)
      .map((_, i) => `Feature ${i + 1}`)
  }

  return metrics
}

