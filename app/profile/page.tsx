import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Calendar, DollarSign, Award, ExternalLink, Edit, Verified, Clock, ThumbsUp } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
              <AvatarFallback className="text-2xl bg-blue-400 text-white">SJ</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">Sarah Johnson</h1>
                    <Badge className="bg-green-500 text-white">
                      <Verified className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xl text-blue-100 mb-2">Senior Full-Stack Developer</p>
                  <div className="flex flex-wrap items-center gap-4 text-blue-100">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      San Francisco, CA
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Member since 2023
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Usually responds in 2 hours
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-medium">Rating</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">4.9</div>
                    <div className="text-sm text-slate-500">47 reviews</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium">Jobs Completed</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">47</div>
                    <div className="text-sm text-slate-500">100% success rate</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium">Total Earned</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">12,450 HBAR</div>
                    <div className="text-sm text-slate-500">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "React", level: 95 },
                    { name: "TypeScript", level: 90 },
                    { name: "Node.js", level: 88 },
                    { name: "Web3", level: 85 },
                    { name: "UI/UX Design", level: 80 },
                  ].map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                        <span className="text-sm text-slate-500">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>English</span>
                    <Badge variant="secondary">Native</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Spanish</span>
                    <Badge variant="outline">Conversational</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>French</span>
                    <Badge variant="outline">Basic</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      I'm a passionate full-stack developer with over 5 years of experience building modern web
                      applications. I specialize in React, Node.js, and Web3 technologies, with a strong focus on
                      creating user-friendly interfaces and scalable backend systems. I've worked with startups and
                      established companies to deliver high-quality solutions that drive business growth.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                      My expertise includes blockchain development, DeFi protocols, and smart contract integration. I'm
                      committed to staying up-to-date with the latest technologies and best practices to deliver
                      exceptional results for my clients.
                    </p>
                  </CardContent>
                </Card>

                {/* Services */}
                <Card>
                  <CardHeader>
                    <CardTitle>Services I Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Web Application Development",
                          description: "Full-stack web apps using React, Node.js, and modern frameworks",
                          price: "Starting at 2,000 HBAR",
                        },
                        {
                          title: "Smart Contract Development",
                          description: "Secure and efficient smart contracts for various blockchain platforms",
                          price: "Starting at 3,000 HBAR",
                        },
                        {
                          title: "UI/UX Design & Development",
                          description: "Beautiful, responsive interfaces that provide excellent user experience",
                          price: "Starting at 1,500 HBAR",
                        },
                        {
                          title: "API Development & Integration",
                          description: "RESTful APIs and third-party service integrations",
                          price: "Starting at 1,200 HBAR",
                        },
                      ].map((service, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          <h4 className="font-semibold text-slate-800 mb-2">{service.title}</h4>
                          <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                          <div className="text-green-600 font-medium">{service.price}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "DeFi Trading Platform",
                      description: "A comprehensive DeFi platform with yield farming, staking, and trading features",
                      image: "/placeholder.svg?height=200&width=300",
                      tags: ["React", "Web3", "DeFi", "TypeScript"],
                      link: "#",
                    },
                    {
                      title: "NFT Marketplace",
                      description: "Full-featured NFT marketplace with minting, trading, and auction capabilities",
                      image: "/placeholder.svg?height=200&width=300",
                      tags: ["Next.js", "IPFS", "Smart Contracts", "UI/UX"],
                      link: "#",
                    },
                    {
                      title: "E-commerce Platform",
                      description: "Modern e-commerce solution with payment integration and inventory management",
                      image: "/placeholder.svg?height=200&width=300",
                      tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
                      link: "#",
                    },
                    {
                      title: "Task Management App",
                      description: "Collaborative task management tool with real-time updates and team features",
                      image: "/placeholder.svg?height=200&width=300",
                      tags: ["Vue.js", "Socket.io", "MongoDB", "Express"],
                      link: "#",
                    },
                  ].map((project, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-slate-100 rounded-t-lg"></div>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {project.title}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {[
                  {
                    client: "TechStartup Inc.",
                    rating: 5,
                    date: "2 weeks ago",
                    project: "E-commerce Website Development",
                    review:
                      "Sarah delivered exceptional work on our e-commerce platform. Her attention to detail and technical expertise exceeded our expectations. The project was completed on time and within budget.",
                  },
                  {
                    client: "CryptoLabs",
                    rating: 5,
                    date: "1 month ago",
                    project: "Smart Contract Development",
                    review:
                      "Outstanding smart contract development work. Sarah's deep understanding of blockchain technology and security best practices gave us confidence in our DeFi protocol launch.",
                  },
                  {
                    client: "DesignCorp",
                    rating: 4,
                    date: "2 months ago",
                    project: "UI/UX Design & Development",
                    review:
                      "Great work on the mobile app interface. Sarah created a beautiful and intuitive design that our users love. Communication was excellent throughout the project.",
                  },
                ].map((review, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{review.client}</CardTitle>
                          <CardDescription>{review.project}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-slate-500">{review.date}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{review.review}</p>
                      <div className="flex items-center mt-4 text-sm text-slate-500">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful review
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      title: "Smart Contract Security Audit",
                      client: "BlockchainLabs",
                      amount: "4,800 HBAR",
                      status: "Completed",
                      date: "Dec 10, 2024",
                    },
                    {
                      title: "E-commerce Website Development",
                      client: "TechStartup Inc.",
                      amount: "3,500 HBAR",
                      status: "Completed",
                      date: "Nov 28, 2024",
                    },
                    {
                      title: "Mobile App UI Design",
                      client: "DesignCorp",
                      amount: "2,200 HBAR",
                      status: "Completed",
                      date: "Nov 15, 2024",
                    },
                    {
                      title: "DeFi Protocol Development",
                      client: "CryptoLabs",
                      amount: "6,500 HBAR",
                      status: "Completed",
                      date: "Oct 30, 2024",
                    },
                  ].map((job, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{job.title}</h4>
                            <p className="text-slate-600">{job.client}</p>
                            <p className="text-sm text-slate-500">{job.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-green-100 text-green-700">{job.status}</Badge>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">{job.amount}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
