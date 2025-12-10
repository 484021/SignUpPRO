"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart3 } from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

const steps = [
  {
    title: "Welcome to SignUpPRO",
    description: "Let's get you started with a quick tour of the platform.",
    icon: Calendar,
  },
  {
    title: "Create Your First Event",
    description: 'Click "Create Event" to set up your first event with slots and capacity limits.',
    icon: Users,
  },
  {
    title: "Track Your Success",
    description: "Monitor signups, view analytics, and manage waitlists from your dashboard.",
    icon: BarChart3,
  },
]

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      localStorage.setItem("onboarding_complete", "true")
      onClose()
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true")
    onClose()
  }

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-4">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg sm:text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">{step.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex justify-center gap-2 mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" onClick={handleSkip} className="flex-1 bg-transparent order-2 sm:order-1">
              Skip
            </Button>
            <Button onClick={handleNext} className="flex-1 order-1 sm:order-2">
              {currentStep < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
