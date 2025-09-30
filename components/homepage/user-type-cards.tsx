import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Target,
  Users,
  Shield,
  Briefcase,
  UserCheck,
  Search,
  User,
  Coins,
  Code,
  DollarSign,
  TrendingUp,
  Building,
  Bot,
  Rocket,
  Cpu
} from "lucide-react"
import Link from "next/link"

export function UserTypeCards() {
  return (
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
  )
}