import  HeroSection  from "@/components/homepage/hero-section"
import { WhatIsFreeLanceDAO } from "@/components/homepage/what-is-freelancedao"
import { UserTypeCards } from "@/components/homepage/user-type-cards"
import { WhyFreeLanceDAO } from "@/components/homepage/why-freelancedao"
import { FeaturedJobs } from "@/components/homepage/featured-jobs"
import { HowItWorks } from "@/components/homepage/how-it-works"
import { FinalCTA } from "@/components/homepage/final-cta"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />
      <WhatIsFreeLanceDAO />
      <UserTypeCards />
      <WhyFreeLanceDAO />
      <FeaturedJobs />
      <HowItWorks />
      <FinalCTA />
    </div>
  )
}
