import  HeroSection  from "@/components/homepage/hero-section"
import { AnimatedMarquee } from "@/components/homepage/animated-marquee"
import {TestimonialsSection} from "@/components/homepage/testimonials-section"
import { WhatIsFreeLanceDAO } from "@/components/homepage/what-is-freelancedao"
import {FaqSection} from "@/components/homepage/faq-section"
import {About} from "@/components/homepage/about"
import { UserTypeCards } from "@/components/homepage/user-type-cards"
import { WhyFreeLanceDAO } from "@/components/homepage/why-freelancedao"
import { FeaturedJobs } from "@/components/homepage/featured-jobs"
import { HowItWorks } from "@/components/homepage/how-it-works"
import { FinalCTA } from "@/components/homepage/final-cta"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />
      <AnimatedMarquee/>
      <About/>
      <FeaturedJobs />
      <WhatIsFreeLanceDAO />
      <TestimonialsSection/>
      <FaqSection/>
     
    </div>
  )
}
