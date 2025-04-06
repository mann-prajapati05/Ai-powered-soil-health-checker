"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

interface SpectralDataFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

export default function SpectralDataForm({ onSubmit, isLoading }: SpectralDataFormProps) {
  const wavelengths = [
    "410",
    "435",
    "460",
    "485",
    "510",
    "535",
    "560",
    "585",
    "610",
    "645",
    "680",
    "705",
    "730",
    "760",
    "810",
    "860",
    "900",
    "940",
  ]

  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert string values to numbers
    const numericData: Record<string, number> = {}
    for (const [key, value] of Object.entries(formData)) {
      if (value) {
        numericData[key] = Number.parseFloat(value)
      }
    }

    onSubmit(numericData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Accordion type="single" collapsible defaultValue="wavelengths">
          <AccordionItem value="wavelengths">
            <AccordionTrigger className="text-lg font-medium">Spectral Wavelength Data</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                {wavelengths.map((wavelength) => (
                  <div key={wavelength} className="space-y-2">
                    <Label htmlFor={wavelength} className="flex items-center gap-1">
                      {wavelength} nm
                      <span className="text-xs text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id={wavelength}
                      name={wavelength}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData[wavelength] || ""}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700">How to use this form</h4>
              <p className="text-sm text-blue-600 mt-1">
                Enter the spectral reflectance values from your soil sample. Not all fields are required - the model
                will work with partial data. For best results, provide at least 5-6 wavelength values.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={isLoading || Object.keys(formData).length === 0}>
            {isLoading ? "Analyzing..." : "Analyze Soil Sample"}
          </Button>
        </div>
      </div>
    </form>
  )
}

