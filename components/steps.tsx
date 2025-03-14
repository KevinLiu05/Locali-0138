"\"use client"

import { cn } from "@/lib/utils"

export interface Step {
  id: string
  label: string
}

interface StepsProps {
  steps: Step[]
  currentStep: string
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              step.id === currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && <div className="h-0.5 w-24 bg-muted-foreground" />}
        </div>
      ))}
    </div>
  )
}

