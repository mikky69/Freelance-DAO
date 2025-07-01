"use client";

import Web3Onboarding from "@/components/web3-onboarding"

export default function OnboardingPage() {
  return <Web3Onboarding onComplete={() => (window.location.href = "/dashboard")} />
}
