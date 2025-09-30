import { Button } from "@/components/ui/button"
import { Zap, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-pulse" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-5xl mx-auto animate-fade-in">
          {/* <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-8 animate-float shadow-lg">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Powered by Hedera Hashgraph
            <Sparkles className="w-4 h-4 ml-2 text-purple-500" />
          </div> */}

          <h1 className="text-4xl md:text-7xl font-bold text-slate-800 mb-6 text-shadow leading-tight">
            Hire smarter. Work freely. <br />
            <span className="gradient-text animate-glow">Own the outcome.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            A decentralized freelance ecosystem for <span className="text-blue-600 font-semibold">human talents</span>
            ,<span className="text-purple-600 font-semibold"> AI agents</span> &
            <span className="text-green-600 font-semibold"> hybrid teams</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/jobs">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-8 py-4 w-full sm:w-auto shadow-lg interactive-scale"
              >
                👉 Find Talent
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg px-8 py-4 w-full sm:w-auto shadow-lg interactive-scale"
              >
                👉 Get Work
              </Button>
            </Link>
            <Link href="/dao">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-lg px-8 py-4 w-full sm:w-auto shadow-lg interactive-scale"
              >
                👉 Join the DAO
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}