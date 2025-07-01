"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  DollarSign,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Handshake,
  AlertCircle,
  Shield,
  Star,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface AIAgent {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  pricingType: "fixed" | "usage" | "subscription"
  owner: {
    id: string
    name: string
    avatar: string
    verified: boolean
    rating: number
    responseTime: string
  }
  performance: {
    rating: number
    completionRate: number
    totalTasks: number
  }
  royaltyRate: number // Percentage that goes to original creator
}

interface NegotiationOffer {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  agentId: string
  proposedPrice: number
  originalPrice: number
  message: string
  status: "pending" | "accepted" | "rejected" | "countered"
  timestamp: string
  expiresAt: string
  terms: {
    taskDescription: string
    deliveryTime: string
    revisions: number
    royaltyAgreement: boolean
  }
}

interface NegotiationModalProps {
  agent: AIAgent | null
  isOpen: boolean
  onClose: () => void
}

export function NegotiationModal({ agent, isOpen, onClose }: NegotiationModalProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [negotiationHistory, setNegotiationHistory] = useState<NegotiationOffer[]>([])

  const [offerData, setOfferData] = useState({
    proposedPrice: agent?.basePrice || 0,
    message: "",
    taskDescription: "",
    deliveryTime: "3-5 days",
    revisions: 2,
    royaltyAgreement: true,
  })

  const steps = [
    { number: 1, title: "Initial Offer", description: "Make your pricing proposal" },
    { number: 2, title: "Terms & Conditions", description: "Define project terms" },
    { number: 3, title: "Review & Submit", description: "Finalize negotiation" },
  ]

  const mockNegotiationHistory: NegotiationOffer[] = [
    {
      id: "1",
      fromUserId: "client1",
      fromUserName: "TechCorp Inc.",
      toUserId: "freelancer1",
      toUserName: "Alex Chen",
      agentId: agent?.id || "",
      proposedPrice: 80,
      originalPrice: 100,
      message: "Would you consider $80 for this task? We have a long-term partnership potential.",
      status: "countered",
      timestamp: "2 hours ago",
      expiresAt: "24 hours",
      terms: {
        taskDescription: "React component development",
        deliveryTime: "2-3 days",
        revisions: 2,
        royaltyAgreement: true,
      },
    },
    {
      id: "2",
      fromUserId: "freelancer1",
      fromUserName: "Alex Chen",
      toUserId: "client1",
      toUserName: "TechCorp Inc.",
      agentId: agent?.id || "",
      proposedPrice: 90,
      originalPrice: 100,
      message: "I can do $90 considering the complexity. This includes 3 revisions and priority support.",
      status: "pending",
      timestamp: "1 hour ago",
      expiresAt: "23 hours",
      terms: {
        taskDescription: "React component development",
        deliveryTime: "2-3 days",
        revisions: 3,
        royaltyAgreement: true,
      },
    },
  ]

  const handleSubmitOffer = async () => {
    if (!agent || !user) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newOffer: NegotiationOffer = {
        id: Date.now().toString(),
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: agent.owner.id,
        toUserName: agent.owner.name,
        agentId: agent.id,
        proposedPrice: offerData.proposedPrice,
        originalPrice: agent.basePrice,
        message: offerData.message,
        status: "pending",
        timestamp: "Just now",
        expiresAt: "48 hours",
        terms: {
          taskDescription: offerData.taskDescription,
          deliveryTime: offerData.deliveryTime,
          revisions: offerData.revisions,
          royaltyAgreement: offerData.royaltyAgreement,
        },
      }

      setNegotiationHistory([...negotiationHistory, newOffer])
      toast.success("Negotiation offer sent successfully!")
      onClose()
    } catch (error) {
      toast.error("Failed to send offer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateSavings = () => {
    if (!agent) return 0
    return ((agent.basePrice - offerData.proposedPrice) / agent.basePrice) * 100
  }

  const calculateRoyalty = () => {
    if (!agent) return 0
    return (offerData.proposedPrice * agent.royaltyRate) / 100
  }

  const calculateNetPrice = () => {
    if (!agent) return 0
    return offerData.proposedPrice - calculateRoyalty()
  }

  if (!agent) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Handshake className="w-6 h-6 mr-2 text-blue-600" />
            Negotiate Pricing
          </DialogTitle>
          <DialogDescription>
            Start a negotiation with {agent.owner.name} for {agent.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step.number ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-800">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-slate-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Agent Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Bot className="w-5 h-5 mr-2" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold">{agent.name}</h3>
                  <Badge variant="outline">{agent.category}</Badge>
                </div>
                <p className="text-slate-600 mb-3">{agent.description}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src={agent.owner.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{agent.owner.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-sm">{agent.owner.name}</span>
                        {agent.owner.verified && <Shield className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        <span>{agent.owner.rating}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{agent.owner.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${agent.basePrice}</div>
                    <div className="text-xs text-slate-500">Base Price</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Negotiation History */}
        {mockNegotiationHistory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                Recent Negotiations
              </CardTitle>
              <CardDescription>Previous offers and counteroffers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNegotiationHistory.map((offer) => (
                  <div key={offer.id} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{offer.fromUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{offer.fromUserName}</span>
                          <Badge
                            variant={
                              offer.status === "accepted"
                                ? "default"
                                : offer.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              offer.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : offer.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : ""
                            }
                          >
                            {offer.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${offer.proposedPrice}</div>
                          <div className="text-xs text-slate-500">{offer.timestamp}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{offer.message}</p>
                      <div className="text-xs text-slate-500">
                        Expires in {offer.expiresAt} • {offer.terms.revisions} revisions • {offer.terms.deliveryTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Initial Offer */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Your Pricing Proposal
                </CardTitle>
                <CardDescription>Make an offer for this AI agent's services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposedPrice">Your Offer ($)</Label>
                      <Input
                        id="proposedPrice"
                        type="number"
                        step="0.01"
                        min="1"
                        value={offerData.proposedPrice}
                        onChange={(e) => setOfferData({ ...offerData, proposedPrice: Number(e.target.value) })}
                        className="text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Negotiation Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Explain your offer and why it's fair..."
                        rows={4}
                        value={offerData.message}
                        onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Pricing Comparison */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Pricing Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span className="font-medium">${agent.basePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Offer:</span>
                          <span className="font-medium text-blue-600">${offerData.proposedPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Creator Royalty ({agent.royaltyRate}%):</span>
                          <span className="font-medium text-purple-600">${calculateRoyalty().toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Net to Agent Owner:</span>
                          <span className="text-green-600">${calculateNetPrice().toFixed(2)}</span>
                        </div>
                        {calculateSavings() > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Your Savings:</span>
                            <span>{calculateSavings().toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Royalty Information */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center text-blue-800 mb-2">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Royalty System</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        {agent.royaltyRate}% of all payments go to the original creator as royalties, ensuring they
                        continue to benefit from their AI agent regardless of ownership transfers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Terms & Conditions */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Project Terms
                </CardTitle>
                <CardDescription>Define the specific terms for this engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskDescription">Task Description</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="Describe what you need the AI agent to do..."
                        rows={4}
                        value={offerData.taskDescription}
                        onChange={(e) => setOfferData({ ...offerData, taskDescription: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Expected Delivery Time</Label>
                      <Input
                        id="deliveryTime"
                        placeholder="e.g., 2-3 days, 1 week"
                        value={offerData.deliveryTime}
                        onChange={(e) => setOfferData({ ...offerData, deliveryTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revisions">Number of Revisions</Label>
                      <Input
                        id="revisions"
                        type="number"
                        min="0"
                        max="10"
                        value={offerData.revisions}
                        onChange={(e) => setOfferData({ ...offerData, revisions: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Terms Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Agreement Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Price:</span>
                          <span className="font-medium">${offerData.proposedPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Time:</span>
                          <span>{offerData.deliveryTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revisions:</span>
                          <span>{offerData.revisions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Royalty to Creator:</span>
                          <span>${calculateRoyalty().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Legal Notice */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Important Terms</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Payment will be held in escrow until completion</li>
                            <li>• Royalties are automatically distributed</li>
                            <li>• All work is subject to platform terms of service</li>
                            <li>• Disputes are resolved through platform arbitration</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Review Your Offer
                </CardTitle>
                <CardDescription>Final review before sending your negotiation offer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Offer Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Your Offer</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-1">${offerData.proposedPrice}</div>
                      <div className="text-sm text-blue-600">
                        {calculateSavings() > 0
                          ? `${calculateSavings().toFixed(1)}% below base price`
                          : calculateSavings() < 0
                            ? `${Math.abs(calculateSavings()).toFixed(1)}% above base price`
                            : "Same as base price"}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Task:</strong> {offerData.taskDescription || "Not specified"}
                        </div>
                        <div>
                          <strong>Delivery:</strong> {offerData.deliveryTime}
                        </div>
                        <div>
                          <strong>Revisions:</strong> {offerData.revisions}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Payment Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Payment:</span>
                          <span className="font-medium">${offerData.proposedPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Creator Royalty:</span>
                          <span className="font-medium">${calculateRoyalty().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (5%):</span>
                          <span className="font-medium">${(offerData.proposedPrice * 0.05).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-green-800">
                          <span>Agent Owner Receives:</span>
                          <span>${(calculateNetPrice() * 0.95).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Your Message</h4>
                      <p className="text-sm text-purple-600">{offerData.message || "No message provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Final Confirmation */}
                <div className="p-4 bg-slate-100 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Ready to Send</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Your negotiation offer will be sent to {agent.owner.name}. They will have 48 hours to respond with
                    an acceptance, rejection, or counteroffer.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmitOffer} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Offer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
