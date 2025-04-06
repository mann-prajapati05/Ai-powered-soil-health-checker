"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart } from "@/components/ui/charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChartIcon } from "lucide-react"

interface SoilChartsProps {
  data: any[]
}

export default function SoilCharts({ data }: SoilChartsProps) {
  // Extract unique soil IDs
  const soilIds = [...new Set(data.map((item) => item.Soil_ID))]

  // Prepare data for moisture and pH chart
  const moistureData = {
    labels: soilIds,
    datasets: [
      {
        label: "Moisture",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample.Moist : null
        }),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.3,
      },
    ],
  }

  const phData = {
    labels: soilIds,
    datasets: [
      {
        label: "pH",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample.Ph : null
        }),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  }

  // Prepare data for NPK chart
  const npkData = {
    labels: soilIds,
    datasets: [
      {
        label: "Nitrogen",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample["Nitro (mg/10 g)"] : null
        }),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
      {
        label: "Phosphorus",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample["Posh Nitro (mg/10 g)"] : null
        }),
        backgroundColor: "rgba(255, 193, 7, 0.6)",
      },
      {
        label: "Potassium",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample["Pota Nitro (mg/10 g)"] : null
        }),
        backgroundColor: "rgba(244, 67, 54, 0.6)",
      },
    ],
  }

  // Prepare data for EC chart
  const ecData = {
    labels: soilIds,
    datasets: [
      {
        label: "EC (u/10 gram)",
        data: soilIds.map((id) => {
          const sample = data.find((item) => item.Soil_ID === id)
          return sample ? sample["EC (u/10 gram)"] : null
        }),
        backgroundColor: "rgba(255, 152, 0, 0.6)",
        borderColor: "rgb(255, 152, 0)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Soil Parameter Visualization
        </CardTitle>
        <CardDescription>Visual representation of key soil parameters across all samples</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="moisture-ph">
          <TabsList className="mb-4">
            <TabsTrigger value="moisture-ph">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Moisture & pH
            </TabsTrigger>
            <TabsTrigger value="npk">
              <BarChart3 className="h-4 w-4 mr-2" />
              NPK Levels
            </TabsTrigger>
            <TabsTrigger value="ec">
              <BarChart3 className="h-4 w-4 mr-2" />
              EC Levels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moisture-ph">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Moisture Levels</CardTitle>
                  <CardDescription>Optimal range: 20-60%</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={moistureData}
                    height={300}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Moisture (%)",
                          },
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">pH Levels</CardTitle>
                  <CardDescription>Optimal range: 6.0-7.0</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={phData}
                    height={300}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 4,
                          max: 9,
                          title: {
                            display: true,
                            text: "pH",
                          },
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="npk">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">NPK Nutrient Levels</CardTitle>
                <CardDescription>Nitrogen, Phosphorus, and Potassium content</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={npkData}
                  height={400}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Concentration (mg/10g)",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ec">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Electrical Conductivity</CardTitle>
                <CardDescription>Optimal range: 100-1500 uS/cm</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={ecData}
                  height={400}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "EC (uS/cm)",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

