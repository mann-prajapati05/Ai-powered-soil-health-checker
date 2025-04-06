"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/charts"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, LineChartIcon, CheckCircle2 } from "lucide-react"

interface ModelMetricsProps {
  metrics: {
    r2Scores: Record<string, number>
    rmseScores: Record<string, number>
    mseScores: Record<string, number>
    bestModels: Record<string, string>
    bestFeatures: Record<string, string[]>
  }
}

export default function ModelMetrics({ metrics }: ModelMetricsProps) {
  const targets = Object.keys(metrics.r2Scores)

  const r2ChartData = {
    labels: targets,
    datasets: [
      {
        label: "R² Score",
        data: targets.map((target) => metrics.r2Scores[target]),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  }

  const rmseChartData = {
    labels: targets,
    datasets: [
      {
        label: "RMSE",
        data: targets.map((target) => metrics.rmseScores[target]),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Technical Model Metrics
        </CardTitle>
        <CardDescription>Performance metrics and feature importance for all prediction models</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="features">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Best Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">R² Scores by Target</CardTitle>
                  <CardDescription>Higher is better (max 1.0)</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={r2ChartData}
                    height={300}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">RMSE by Target</CardTitle>
                  <CardDescription>Lower is better</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={rmseChartData} height={300} />
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Model Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target</TableHead>
                      <TableHead>Best Model</TableHead>
                      <TableHead className="text-right">R²</TableHead>
                      <TableHead className="text-right">RMSE</TableHead>
                      <TableHead className="text-right">MSE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.map((target) => (
                      <TableRow key={target}>
                        <TableCell className="font-medium">{target}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                            {metrics.bestModels[target]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{metrics.r2Scores[target].toFixed(3)}</TableCell>
                        <TableCell className="text-right">{metrics.rmseScores[target].toFixed(3)}</TableCell>
                        <TableCell className="text-right">{metrics.mseScores[target].toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {targets.map((target) => (
                <Card key={target}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{target} - Top Features</CardTitle>
                    <CardDescription>Most important features for prediction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {metrics.bestFeatures[target]?.slice(0, 5).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      )) || <p className="text-sm text-gray-500">No feature data available</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

