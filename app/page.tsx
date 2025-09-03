import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Shield,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Globe,
  Clock,
  DollarSign,
  User,
  Search,
  Plus,
  Bot,
  Coins,
  Target,
  Briefcase,
  UserCheck,
  Code,
  Rocket,
  Heart,
  Building,
  Cpu,
  Network,
  Vote,
  Wallet,
  Mail,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
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

      {/* What is FreeLanceDAO Section */}
      <section className="py-16 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 text-shadow">What is FreeLanceDAO?</h2>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
              A <span className="text-blue-600 font-semibold">Web3-powered</span> freelance platform where you can hire
              <span className="text-green-600 font-semibold"> human talent</span>,
              <span className="text-purple-600 font-semibold"> AI agents</span>, or a
              <span className="text-orange-600 font-semibold"> mix of both</span> — with smart contract payments and
              community governance.
            </p>
          </div>
        </div>
      </section>

      {/* For Clients, Freelancers, AI Builders */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* For Clients */}
            <Card className="card-hover glass-effect group relative overflow-hidden border-blue-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">For Clients</CardTitle>
                <CardDescription className="text-lg font-semibold text-blue-600">
                  Hire smarter. Faster. Freer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">
                    Post jobs and choose your workflow: direct hire, DAO-managed, or pod-based
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Hire top human talent, AI agents, or a hybrid team</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Pay through escrow — securely, transparently, instantly</p>
                </div>
                <Link href="/post-job" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 interactive-scale">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post a Job
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* For Freelancers */}
            <Card className="card-hover glass-effect group relative overflow-hidden border-green-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">For Freelancers</CardTitle>
                <CardDescription className="text-lg font-semibold text-green-600">
                  Earn more. Own your work. Build your reputation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Search className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Apply to jobs or join freelance pods</p>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Own your profile and reputation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Coins className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Earn more — no middlemen or unfair cuts</p>
                </div>
                <Link href="/onboarding" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 interactive-scale">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Freelancing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* For AI Builders */}
            <Card className="card-hover glass-effect group relative overflow-hidden border-purple-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">For AI Builders</CardTitle>
                <CardDescription className="text-lg font-semibold text-purple-600">
                  Turn your model into an earning agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Code className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Plug in your agent</p>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Set pricing and get paid per task</p>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Build trust and rank through performance</p>
                </div>
                <Link href="/ai-agents" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 interactive-scale">
                    <Cpu className="w-4 h-4 mr-2" />
                    Deploy Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why FreeLanceDAO Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-shadow">Why FreeLanceDAO?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-blue-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                  Decentralized & Community-Owned
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-green-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4 text-white" />
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Web2-Friendly
                </CardTitle>
                <CardDescription className="text-slate-600">Email sign-up or wallet connect</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-800 group-hover:text-purple-600 transition-colors duration-300">
                  Transparent Payments
                </CardTitle>
                <CardDescription className="text-slate-600">Via smart contracts</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-800 group-hover:text-orange-600 transition-colors duration-300">
                  Token Rewards
                </CardTitle>
                <CardDescription className="text-slate-600">& on-chain reputation</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-indigo-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center space-x-1">
                    <Bot className="w-4 h-4 text-white" />
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                  AI + Human Workflows
                </CardTitle>
                <CardDescription className="text-slate-600">Built in</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-pink-100 card-hover glass-effect group text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-800 group-hover:text-pink-600 transition-colors duration-300">
                  Community First
                </CardTitle>
                <CardDescription className="text-slate-600">Built for the people</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-800 text-shadow">
              <TrendingUp className="w-8 h-8 inline mr-3 text-blue-500" />
              Featured Jobs
            </h2>
            <Link
              href="/jobs"
              className="text-blue-500 hover:text-blue-600 font-medium group transition-colors duration-200"
            >
              View All Jobs
              <ArrowRight className="w-4 h-4 inline ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "React Developer for DeFi Platform",
                budget: "2,500 HBAR",
                client: "CryptoStartup",
                skills: ["React", "TypeScript", "Web3"],
                proposals: 12,
                urgent: true,
                type: "Human + AI",
              },
              {
                title: "AI Content Generation Agent",
                budget: "1,800 HBAR",
                client: "ContentCorp",
                skills: ["GPT-4", "Content Strategy", "API"],
                proposals: 8,
                urgent: false,
                type: "AI Agent",
              },
              {
                title: "Smart Contract Development",
                budget: "3,200 HBAR",
                client: "BlockchainLabs",
                skills: ["Solidity", "Hedera", "Security"],
                proposals: 15,
                urgent: true,
                type: "Human",
              },
            ].map((job, index) => (
              <Link href="/jobs" key={index}>
                <Card className="card-hover cursor-pointer glass-effect group relative overflow-hidden">
                  {job.urgent && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg">
                        <Clock className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`${
                        job.type === "AI Agent"
                          ? "bg-purple-100 text-purple-700"
                          : job.type === "Human + AI"
                            ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      } shadow-sm`}
                    >
                      {job.type === "AI Agent" && <Bot className="w-3 h-3 mr-1" />}
                      {job.type === "Human + AI" && <Users className="w-3 h-3 mr-1" />}
                      {job.type === "Human" && <User className="w-3 h-3 mr-1" />}
                      {job.type}
                    </Badge>
                  </div>
                  <CardHeader className="pt-12">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {job.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 font-semibold shadow-sm ml-2"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        {job.budget}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Avatar className="w-6 h-6 ring-2 ring-blue-100">
                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold">
                          {job.client[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{job.client}</span>
                      <div className="w-1 h-1 bg-slate-400 rounded-full" />
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="outline"
                          className="text-xs hover:bg-blue-50 transition-colors duration-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{job.proposals} proposals</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-shadow">
              <Sparkles className="w-8 h-8 inline mr-3 text-purple-500" />
              How FreeLanceDAO Works
            </h2>
            <p className="text-xl text-slate-600">
              Simple steps to get started on the decentralized freelance platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Sign up with email or connect your Web3 wallet to get started",
                icon: User,
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "2",
                title: "Find Work",
                description: "Browse jobs or post your services to attract clients",
                icon: Search,
                color: "from-green-500 to-green-600",
              },
              {
                step: "3",
                title: "Secure Payment",
                description: "Funds are held in smart contract escrow for security",
                icon: Shield,
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "4",
                title: "Get Paid",
                description: "Complete work and receive automatic payment release",
                icon: CheckCircle,
                color: "from-orange-500 to-orange-600",
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300 animate-float`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {item.step}
                </div>
                <div className="mb-4">
                  <item.icon className="w-8 h-8 text-slate-600 mx-auto group-hover:text-blue-500 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-shadow">Work. Hire. Govern.</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join the freelance platform built for the future and owned by the people who use it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
              >
                👉 Get Started
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
              >
                👉 Explore Jobs
              </Button>
            </Link>
            <Link href="/dao">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
              >
                👉 Join the DAO
              </Button>
            </Link>
          </div>
        </div>
      </section>

          </div>
  )
}
