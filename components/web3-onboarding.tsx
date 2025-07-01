"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, Users, DollarSign, CheckCircle, ArrowRight, Lightbulb, Star, Lock, Zap } from "lucide-react"
import { useState } from "react"

interface Web3OnboardingProps {
  onComplete?: () => void
}

export function Web3Onboarding({ onComplete }: Web3OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      title: "Welcome to Web3 Freelancing",
      description: "Discover the benefits of decentralized work",
      icon: <Star className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Welcome to the Future of Work</h3>
            <p className="text-slate-600">
              FreeLanceDAO combines the familiarity of traditional freelancing with the security and transparency of
              blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Secure Payments</h4>
              <p className="text-sm text-slate-600">Smart contracts ensure you always get paid</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Global Network</h4>
              <p className="text-sm text-slate-600">Connect with clients worldwide</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Lower Fees</h4>
              <p className="text-sm text-slate-600">Keep more of what you earn</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Understanding Smart Contracts",
      description: "Learn how your payments are secured",
      icon: <Lock className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Smart Contract Escrow</h3>
            <p className="text-slate-600">Your payments are automatically secured by blockchain technology</p>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Think of smart contracts as digital agreements that automatically execute when conditions are met - no
              middleman needed!
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Client deposits funds</h4>
                <p className="text-sm text-slate-600">Money is locked in a smart contract, not with us</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-slate-800">You complete the work</h4>
                <p className="text-sm text-slate-600">Submit your deliverables as agreed</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Automatic payment release</h4>
                <p className="text-sm text-slate-600">Funds are released to you instantly upon approval</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Connect Your Wallet",
      description: "Set up your digital wallet for payments",
      icon: <Wallet className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Your Digital Wallet</h3>
            <p className="text-slate-600">A wallet is like your digital bank account for receiving HBAR payments</p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Don't worry! You can start working immediately and connect your wallet later when you're ready to receive
              payments.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg text-center">
              <Wallet className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800 mb-1">Recommended: HashPack Wallet</h4>
              <p className="text-sm text-slate-600 mb-3">The most popular Hedera wallet with great security</p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <h5 className="font-medium text-slate-800">Free to use</h5>
                <p className="text-xs text-slate-600">No monthly fees</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <h5 className="font-medium text-slate-800">Your keys, your crypto</h5>
                <p className="text-xs text-slate-600">You control your funds</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Start Earning",
      description: "You're ready to begin your Web3 journey",
      icon: <Zap className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">You're All Set!</h3>
            <p className="text-slate-600">
              Congratulations! You now understand the basics of Web3 freelancing on FreeLanceDAO.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-3">What happens next?</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-700">Browse available jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-700">Submit proposals to clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-700">Get hired and start working</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-700">Connect wallet when ready for payment</span>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Remember: You can always access this tutorial again from your profile settings if you need a refresher!
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      setCompletedSteps([...completedSteps, currentStep])
      onComplete?.()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <div className="flex items-center space-x-2">{steps[currentStep].icon}</div>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-lg">{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">{steps[currentStep].content}</div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={nextStep} className="bg-blue-500 hover:bg-blue-600">
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Web3Onboarding
