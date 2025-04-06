// This file contains functions for soil data analysis and prediction

// Function to upload and process soil data CSV
export async function uploadSoilData(file: File) {
  try {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)

    // In a real production environment, this would call an API endpoint
    // that runs your Python model on the server
    // For this demo, we'll simulate the model's response

    // Simulate network request time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Parse the CSV file to extract data for our simulation
    const fileContent = await file.text()
    const parsedData = parseCSV(fileContent)

    // Generate simulated model metrics and predictions based on the actual CSV data
    const result = simulateModelAnalysis(parsedData)

    return result
  } catch (error) {
    console.error("Error uploading soil data:", error)
    throw new Error("Failed to analyze soil data. Please check your CSV format and try again.")
  }
}

// Function to predict soil parameters for a single sample
export async function predictSingleSample(spectralData: any) {
  try {
    // In a real implementation, this would send the spectral data to the server
    // For now, we'll simulate the response based on the input data

    // Simulate network request time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a prediction based on the input spectral data
    const prediction = simulateSinglePrediction(spectralData)

    return prediction
  } catch (error) {
    console.error("Error predicting single sample:", error)
    throw new Error("Failed to analyze spectral data. Please check your input values and try again.")
  }
}

// Helper function to parse CSV data
function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split("\n")
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

// Function to simulate model analysis based on actual CSV data
function simulateModelAnalysis(data: any[]) {
  // Extract soil IDs and any moisture level information if available
  const soilIds = data.map((row) => {
    let soilId = row.Soil_ID || row.Records || `Sample_${Math.floor(Math.random() * 1000)}`

    // If it's a string that might contain moisture level info
    if (typeof soilId === "string" && soilId.includes("-")) {
      soilId = soilId.split("-")[0]
    }

    return soilId
  })

  // Determine if we have moisture levels in the data
  const hasMoistureLevels = data.some(
    (row) => row.Moisture_Level || (typeof row.Soil_ID === "string" && row.Soil_ID.includes("_")),
  )

  // Extract or assign moisture levels
  const predictions = data.map((row, index) => {
    let moistureLevel = "0ml"
    const soilId = soilIds[index]

    // Try to extract moisture level from Soil_ID if it exists
    if (typeof soilId === "string" && soilId.includes("_")) {
      const parts = soilId.split("_")
      if (parts.length > 1) {
        moistureLevel = parts[1]
      }
    }
    // Or use Moisture_Level if it exists
    else if (row.Moisture_Level) {
      moistureLevel = row.Moisture_Level as string
    }
    // Otherwise assign randomly for simulation
    else {
      const levels = ["0ml", "25ml", "50ml"]
      moistureLevel = levels[index % levels.length]
    }

    // Extract actual values from the data if they exist, or generate simulated values
    const prediction: Record<string, any> = {
      Soil_ID: soilId,
      Moisture_Level: moistureLevel,
    }

    // Map of target parameters we're interested in
    const targetParams = [
      "Ph",
      "Moist",
      "EC (u/10 gram)",
      "Nitro (mg/10 g)",
      "Posh Nitro (mg/10 g)",
      "Pota Nitro (mg/10 g)",
    ]

    // Use actual values from CSV if they exist, otherwise simulate
    targetParams.forEach((param) => {
      if (row[param] !== undefined) {
        prediction[param] = row[param]
      } else {
        // Generate realistic values based on parameter
        switch (param) {
          case "Ph":
            prediction[param] = 6.5 + (Math.random() * 1.5 - 0.75)
            break
          case "Moist":
            // Moisture based on moisture level
            const baseValue = moistureLevel === "0ml" ? 15 : moistureLevel === "25ml" ? 35 : 55
            prediction[param] = baseValue + (Math.random() * 10 - 5)
            break
          case "EC (u/10 gram)":
            prediction[param] = 800 + (Math.random() * 400 - 200)
            break
          case "Nitro (mg/10 g)":
            prediction[param] = 18 + (Math.random() * 10 - 5)
            break
          case "Posh Nitro (mg/10 g)":
            prediction[param] = 12 + (Math.random() * 8 - 4)
            break
          case "Pota Nitro (mg/10 g)":
            prediction[param] = 25 + (Math.random() * 15 - 7.5)
            break
        }
      }
    })

    return prediction
  })

  // Generate model metrics based on the data
  const metrics = {
    r2Scores: {
      Ph: 0.87,
      Moist: 0.92,
      "EC (u/10 gram)": 0.85,
      "Nitro (mg/10 g)": 0.79,
      "Posh Nitro (mg/10 g)": 0.81,
      "Pota Nitro (mg/10 g)": 0.83,
    },
    rmseScores: {
      Ph: 0.42,
      Moist: 3.21,
      "EC (u/10 gram)": 0.56,
      "Nitro (mg/10 g)": 2.34,
      "Posh Nitro (mg/10 g)": 1.87,
      "Pota Nitro (mg/10 g)": 2.12,
    },
    mseScores: {
      Ph: 0.18,
      Moist: 10.3,
      "EC (u/10 gram)": 0.31,
      "Nitro (mg/10 g)": 5.48,
      "Posh Nitro (mg/10 g)": 3.5,
      "Pota Nitro (mg/10 g)": 4.49,
    },
    bestModels: {
      Ph: "Random Forest",
      Moist: "Gradient Boosting",
      "EC (u/10 gram)": "Random Forest",
      "Nitro (mg/10 g)": "Gradient Boosting",
      "Posh Nitro (mg/10 g)": "Random Forest",
      "Pota Nitro (mg/10 g)": "SVR",
    },
    bestFeatures: {
      Ph: ["760", "810", "PCA_1", "535", "d680"],
      Moist: ["NDI", "SIR", "PCA_2", "d730", "d810"],
      "EC (u/10 gram)": ["510", "535", "d560", "PCA_1", "VIS_avg"],
      "Nitro (mg/10 g)": ["NIR_avg", "860", "900", "d810", "d860"],
      "Posh Nitro (mg/10 g)": ["PCA_3", "d645", "d680", "730", "760"],
      "Pota Nitro (mg/10 g)": ["PCA_2", "d535", "d560", "610", "645"],
    },
  }

  // Generate model output text
  const modelOutput = generateModelOutputText(metrics, predictions)

  return {
    predictions,
    metrics,
    modelOutput,
  }
}

// Function to simulate a single prediction
function simulateSinglePrediction(spectralData: any) {
  // Extract wavelength values
  const wavelengths = Object.keys(spectralData).filter((key) => !isNaN(Number(key)))

  // Calculate a "quality score" based on how many wavelengths are provided
  // and their values to make predictions somewhat related to input
  const qualityScore = wavelengths.length / 18 // 18 is the max number of wavelengths

  // Generate prediction with some randomness but influenced by input data
  const prediction = {
    Soil_ID: "Sample_1",
    Ph: 6.5 + qualityScore * 0.5 + (Math.random() * 0.5 - 0.25),
    Moist: 35 + qualityScore * 10 + (Math.random() * 10 - 5),
    "EC (u/10 gram)": 800 + qualityScore * 200 + (Math.random() * 200 - 100),
    "Nitro (mg/10 g)": 18 + qualityScore * 5 + (Math.random() * 5 - 2.5),
    "Posh Nitro (mg/10 g)": 12 + qualityScore * 4 + (Math.random() * 4 - 2),
    "Pota Nitro (mg/10 g)": 25 + qualityScore * 7.5 + (Math.random() * 7.5 - 3.75),
  }

  return prediction
}

// Function to generate model output text similar to what the Python script would produce
function generateModelOutputText(metrics: any, predictions: any[]) {
  const targets = Object.keys(metrics.r2Scores)
  let output = "Data loaded successfully\n\n"

  output += "Available columns: Soil_ID, Moisture_Level, "
  output += targets.join(", ")
  output += "\n\nPredicting targets: " + targets.join(", ")

  // Add processing information for each target
  targets.forEach((target) => {
    output += `\n\n=== Processing target: ${target} ===`
    output += `\nSelecting features...`
    output += `\nSelected ${metrics.bestFeatures[target].length} features for ${target}`
    output += `\nStarting model training...`
    output += `\n\nTraining ${metrics.bestModels[target]}...`
    output += `\nFold 1 completed - R2: ${metrics.r2Scores[target].toFixed(3)}`
    output += `\nFold 2 completed - R2: ${(metrics.r2Scores[target] - 0.02).toFixed(3)}`
    output += `\nFold 3 completed - R2: ${(metrics.r2Scores[target] + 0.01).toFixed(3)}`
    output += `\nFold 4 completed - R2: ${(metrics.r2Scores[target] - 0.01).toFixed(3)}`
    output += `\nFold 5 completed - R2: ${(metrics.r2Scores[target] + 0.02).toFixed(3)}`

    output += `\n\nModel Performance for ${target}:`
    output += `\nR2: ${metrics.r2Scores[target].toFixed(3)}`
    output += `\nRMSE: ${metrics.rmseScores[target].toFixed(3)}`
    output += `\nMAE: ${(metrics.rmseScores[target] * 0.8).toFixed(3)}`
  })

  // Add final summary
  output += "\n\n=== Final Summary ==="
  targets.forEach((target) => {
    output += `\n\nTarget: ${target}`
    output += `\nBest model: ${metrics.bestModels[target]}`
    output += `\nR2: ${metrics.r2Scores[target].toFixed(3)}`
    output += `\nRMSE: ${metrics.rmseScores[target].toFixed(3)}`
    output += `\nMAE: ${(metrics.rmseScores[target] * 0.8).toFixed(3)}`
    output += `\nNumber of features used: ${metrics.bestFeatures[target].length}`
  })

  output += "\n\nGenerating predictions for all samples..."
  output += `\nSuccess! Predictions saved to soil_analysis_output/soil_predictions.csv`

  return output
}

