import {
  Sparkles,
  User,
  Search,
  Shield,
  CheckCircle
} from "lucide-react"

export function HowItWorks() {
  const steps = [
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
  ]

  return (
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
          {steps.map((item, index) => (
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
  )
}