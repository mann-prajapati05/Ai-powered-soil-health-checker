"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/charts"
import { AlertTriangle, CheckCircle, Droplet, Leaf, Gauge } from "lucide-react"

interface SoilRecommendationsProps {
  prediction: any
}

export default function SoilRecommendations({ prediction }: SoilRecommendationsProps) {
  // Generate NPK recommendation based on soil values
  const generateNPKRecommendation = () => {
    const N = (Math.max(0, 25 - prediction["Nitro (mg/10 g)"]) / 25) * 100
    const P = (Math.max(0, 15 - prediction["Posh Nitro (mg/10 g)"]) / 15) * 100
    const K = (Math.max(0, 30 - prediction["Pota Nitro (mg/10 g)"]) / 30) * 100

    // Ensure at least some minimum recommendation
    return {
      N: Math.max(N, 10),
      P: Math.max(P, 10),
      K: Math.max(K, 10),
    }
  }

  const npkRec = generateNPKRecommendation()

  const fertilizerChartData = {
    labels: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"],
    datasets: [
      {
        label: "Recommended %",
        data: [npkRec.N, npkRec.P, npkRec.K],
        backgroundColor: ["rgba(76, 175, 80, 0.6)", "rgba(255, 193, 7, 0.6)", "rgba(244, 67, 54, 0.6)"],
        borderColor: ["rgb(76, 175, 80)", "rgb(255, 193, 7)", "rgb(244, 67, 54)"],
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Soil Health Recommendations
        </CardTitle>
        <CardDescription>Personalized recommendations based on your soil analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="actions">
          <TabsList className="mb-4">
            <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
            <TabsTrigger value="fertilizer">Fertilizer Blend</TabsTrigger>
          </TabsList>

          <TabsContent value="actions">
            <div className="space-y-4">
              {/* Moisture recommendation */}
              {prediction.Moist < 20 ? (
                <Alert variant="destructive">
                  <Droplet className="h-4 w-4" />
                  <AlertTitle>Irrigation Needed</AlertTitle>
                  <AlertDescription>
                    Soil moisture is very low ({prediction.Moist.toFixed(1)}%). Increase watering frequency or amount.
                  </AlertDescription>
                </Alert>
              ) : prediction.Moist > 60 ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Reduce Irrigation</AlertTitle>
                  <AlertDescription>
                    Soil is oversaturated ({prediction.Moist.toFixed(1)}%). Reduce watering to prevent root rot and
                    nutrient leaching.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Moisture Optimal</AlertTitle>
                  <AlertDescription>
                    Current moisture level ({prediction.Moist.toFixed(1)}%) is within the optimal range. Continue
                    current watering schedule.
                  </AlertDescription>
                </Alert>
              )}

              {/* pH recommendation */}
              {prediction.Ph < 6 ? (
                <Alert variant="warning">
                  <Gauge className="h-4 w-4" />
                  <AlertTitle>Increase pH</AlertTitle>
                  <AlertDescription>
                    Soil is too acidic (pH {prediction.Ph.toFixed(1)}). Add agricultural lime to raise pH to optimal
                    range (6-7).
                  </AlertDescription>
                </Alert>
              ) : prediction.Ph > 7 ? (
                <Alert variant="warning">
                  <Gauge className="h-4 w-4" />
                  <AlertTitle>Lower pH</AlertTitle>
                  <AlertDescription>
                    Soil is too alkaline (pH {prediction.Ph.toFixed(1)}). Add sulfur or organic matter to reduce pH.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>pH Optimal</AlertTitle>
                  <AlertDescription>
                    Soil pH ({prediction.Ph.toFixed(1)}) is in the ideal range for most crops.
                  </AlertDescription>
                </Alert>
              )}

              {/* Nitrogen recommendation */}
              {prediction["Nitro (mg/10 g)"] < 20 ? (
                <Alert variant="warning">
                  <Leaf className="h-4 w-4" />
                  <AlertTitle>Nitrogen Deficient</AlertTitle>
                  <AlertDescription>
                    Level is low ({prediction["Nitro (mg/10 g)"].toFixed(1)} mg). Apply nitrogen-rich fertilizer (e.g.,
                    urea, ammonium nitrate, or compost).
                  </AlertDescription>
                </Alert>
              ) : prediction["Nitro (mg/10 g)"] > 50 ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Excess Nitrogen</AlertTitle>
                  <AlertDescription>
                    Level is high ({prediction["Nitro (mg/10 g)"].toFixed(1)} mg). Reduce nitrogen inputs to prevent
                    nutrient imbalance and potential plant damage.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Nitrogen Adequate</AlertTitle>
                  <AlertDescription>
                    Nitrogen levels ({prediction["Nitro (mg/10 g)"].toFixed(1)} mg) are sufficient for plant growth.
                  </AlertDescription>
                </Alert>
              )}

              {/* EC recommendation */}
              {prediction["EC (u/10 gram)"] < 100 ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Low Salinity</AlertTitle>
                  <AlertDescription>
                    EC is very low ({prediction["EC (u/10 gram)"].toFixed(1)} uS/cm). Consider adding balanced nutrients
                    to irrigation water.
                  </AlertDescription>
                </Alert>
              ) : prediction["EC (u/10 gram)"] > 1500 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>High Salinity</AlertTitle>
                  <AlertDescription>
                    EC is very high ({prediction["EC (u/10 gram)"].toFixed(1)} uS/cm). Leach soil with clean water to
                    reduce salt levels.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>EC Normal</AlertTitle>
                  <AlertDescription>
                    Electrical conductivity ({prediction["EC (u/10 gram)"].toFixed(1)} uS/cm) is within optimal range.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fertilizer">
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Recommended Fertilizer Blend</h3>
                <p className="text-sm text-green-700">
                  Based on your soil analysis, we recommend the following NPK ratio for optimal plant growth:
                </p>
              </div>

              <div className="h-80">
                <BarChart
                  data={fertilizerChartData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Percentage of Nutrient Requirement",
                        },
                      },
                    },
                    plugins: {
                      title: {
                        display: true,
                        text: "Recommended Fertilizer Composition (%)",
                      },
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Nitrogen (N)</h4>
                  <p className="text-2xl font-bold text-green-700">{Math.round(npkRec.N)}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    {npkRec.N > 50 ? "High priority" : npkRec.N > 25 ? "Medium priority" : "Low priority"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Phosphorus (P)</h4>
                  <p className="text-2xl font-bold text-yellow-700">{Math.round(npkRec.P)}%</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {npkRec.P > 50 ? "High priority" : npkRec.P > 25 ? "Medium priority" : "Low priority"}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">Potassium (K)</h4>
                  <p className="text-2xl font-bold text-red-700">{Math.round(npkRec.K)}%</p>
                  <p className="text-xs text-red-600 mt-1">
                    {npkRec.K > 50 ? "High priority" : npkRec.K > 25 ? "Medium priority" : "Low priority"}
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTitle>Application Recommendation</AlertTitle>
                <AlertDescription>
                  Apply a {Math.round(npkRec.N)}-{Math.round(npkRec.P)}-{Math.round(npkRec.K)} NPK fertilizer at a rate
                  of
                  {npkRec.N > 50 ? " 5-7 " : npkRec.N > 25 ? " 3-5 " : " 2-3 "}
                  kg per 1000 m² (or {npkRec.N > 50 ? " 1-1.5 " : npkRec.N > 25 ? " 0.6-1 " : " 0.4-0.6 "}
                  lbs per 100 ft²).
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

