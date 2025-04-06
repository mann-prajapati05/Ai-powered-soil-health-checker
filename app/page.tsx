"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { UploadCloud, FileSpreadsheet, Droplet, Leaf, AlertTriangle, Terminal } from "lucide-react"
import SoilHealthGauge from "@/components/soil-health-gauge"
import SpectralDataForm from "@/components/spectral-data-form"
import ModelMetrics from "@/components/model-metrics"
import SoilSampleTable from "@/components/soil-sample-table"
import SoilRecommendations from "@/components/soil-recommendations"
import SoilCharts from "@/components/soil-charts"
import { uploadSoilData, predictSingleSample } from "@/lib/soil-analysis"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [soilData, setSoilData] = useState<any>(null)
  const [singlePrediction, setSinglePrediction] = useState<any>(null)
  const [modelOutput, setModelOutput] = useState<string>("")
  const [showModelOutput, setShowModelOutput] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null) // Clear any previous errors
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await uploadSoilData(file)
      setSoilData(result)
      setModelOutput(result.modelOutput || "")
      setAnalysisComplete(true)
      toast({
        title: "Analysis complete",
        description: "Your soil data has been successfully analyzed",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your soil data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpectralDataSubmit = async (spectralData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await predictSingleSample(spectralData)
      setSinglePrediction(result)
      toast({
        title: "Prediction complete",
        description: "Your soil sample has been successfully analyzed",
      })
    } catch (error) {
      console.error("Prediction error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Prediction failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your soil data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2">
          <Leaf className="h-10 w-10 text-green-600" />
          <h1 className="text-4xl font-bold text-green-800">Soil Health AI</h1>
        </div>
        <p className="text-lg text-gray-600 mt-2 text-center max-w-2xl">
          Empowering farmers with actionable insights on soil health using advanced spectral analysis
        </p>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="text-lg py-3">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Upload Soil Data
          </TabsTrigger>
          <TabsTrigger value="input" className="text-lg py-3">
            <Droplet className="mr-2 h-5 w-5" />
            Input Spectral Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Soil Data CSV</CardTitle>
              <CardDescription>Upload your soil data CSV file to analyze multiple soil samples at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">Drag and drop your CSV file here, or click to browse</p>
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
                {file && <p className="text-sm text-green-600 mt-2">Selected file: {file.name}</p>}
                <Button onClick={handleFileUpload} className="mt-4" disabled={!file || isLoading}>
                  {isLoading ? "Analyzing..." : "Analyze Soil Data"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Analysis failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {analysisComplete && soilData && (
            <>
              <ModelMetrics metrics={soilData.metrics} />

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Soil Sample Analysis</CardTitle>
                  <CardDescription>Analysis results for all soil samples by moisture level</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">All Samples</TabsTrigger>
                      <TabsTrigger value="0ml">0ml Moisture</TabsTrigger>
                      <TabsTrigger value="25ml">25ml Moisture</TabsTrigger>
                      <TabsTrigger value="50ml">50ml Moisture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                      <SoilSampleTable samples={soilData.predictions} />
                    </TabsContent>
                    <TabsContent value="0ml">
                      <SoilSampleTable samples={soilData.predictions.filter((s: any) => s.Moisture_Level === "0ml")} />
                    </TabsContent>
                    <TabsContent value="25ml">
                      <SoilSampleTable samples={soilData.predictions.filter((s: any) => s.Moisture_Level === "25ml")} />
                    </TabsContent>
                    <TabsContent value="50ml">
                      <SoilSampleTable samples={soilData.predictions.filter((s: any) => s.Moisture_Level === "50ml")} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <SoilCharts data={soilData.predictions} />

              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-green-600" />
                      Model Output
                    </CardTitle>
                    <CardDescription>Raw output from the AI model execution</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowModelOutput(!showModelOutput)}>
                    {showModelOutput ? "Hide" : "Show"} Output
                  </Button>
                </CardHeader>
                {showModelOutput && (
                  <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm">
                      <pre>{modelOutput}</pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Soil Spectral Data</CardTitle>
              <CardDescription>Enter your soil's spectral data to get predictions and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Not all 18 wavelength values are required. Fill in the ones you have available.
                </AlertDescription>
              </Alert>
              <SpectralDataForm onSubmit={handleSpectralDataSubmit} isLoading={isLoading} />

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Prediction failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {singlePrediction && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Soil Health Score</CardTitle>
                    <CardDescription>Overall health assessment of your soil sample</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <SoilHealthGauge prediction={singlePrediction} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Soil Parameters</CardTitle>
                    <CardDescription>Predicted values for key soil parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">pH Level</p>
                        <p className="text-2xl font-bold text-green-700">{singlePrediction.Ph.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Optimal: 6.0-7.0</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Moisture</p>
                        <p className="text-2xl font-bold text-green-700">{singlePrediction.Moist.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">Optimal: 20-60%</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Nitrogen</p>
                        <p className="text-2xl font-bold text-green-700">
                          {singlePrediction["Nitro (mg/10 g)"].toFixed(1)} mg
                        </p>
                        <p className="text-xs text-gray-500">Optimal: &gt;20 mg</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">EC</p>
                        <p className="text-2xl font-bold text-green-700">
                          {singlePrediction["EC (u/10 gram)"].toFixed(1)} uS/cm
                        </p>
                        <p className="text-xs text-gray-500">Normal: 100-1500</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SoilRecommendations prediction={singlePrediction} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

