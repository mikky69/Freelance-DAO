"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  MessageSquare,
  Heart,
  Code,
  Palette,
  PenTool,
  Camera,
  Megaphone,
  BarChart,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Target,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const categories = [
  { id: "all", name: "All Categories", icon: Globe, count: 1247 },
  { id: "web-dev", name: "Web Development", icon: Code, count: 324 },
  { id: "mobile-dev", name: "Mobile Development", icon: Smartphone, count: 189 },
  { id: "design", name: "Design & Creative", icon: Palette, count: 267 },
  { id: "writing", name: "Writing & Content", icon: PenTool, count: 156 },
  { id: "marketing", name: "Digital Marketing", icon: Megaphone, count: 198 },
  { id: "data", name: "Data & Analytics", icon: BarChart, count: 87 },
  { id: "photography", name: "Photography", icon: Camera, count: 134 },
  { id: "blockchain", name: "Blockchain & Web3", icon: Shield, count: 92 },
]

const freelancers = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Full-Stack Developer & Blockchain Expert",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 85,
    location: "San Francisco, CA",
    verified: true,
    topRated: true,
    skills: ["React", "Node.js", "Solidity", "Web3", "TypeScript"],
    description:
      "Experienced full-stack developer specializing in decentralized applications and smart contracts. 5+ years building scalable web applications.",
    completedJobs: 89,
    successRate: 98,
    responseTime: "1 hour",
    languages: ["English", "Mandarin"],
    category: "web-dev",
    availability: "Available now",
    portfolio: [
      { title: "DeFi Trading Platform", image: "/placeholder.svg?height=200&width=300" },
      { title: "NFT Marketplace", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "UI/UX Designer & Brand Strategist",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    reviews: 94,
    hourlyRate: 65,
    location: "Austin, TX",
    verified: true,
    topRated: false,
    skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research", "Branding"],
    description:
      "Creative designer with a passion for user-centered design. Specialized in creating intuitive interfaces for Web3 and fintech applications.",
    completedJobs: 67,
    successRate: 96,
    responseTime: "2 hours",
    languages: ["English", "Spanish"],
    category: "design",
    availability: "Available in 2 days",
    portfolio: [
      { title: "Crypto Wallet App", image: "/placeholder.svg?height=200&width=300" },
      { title: "DAO Governance Platform", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: 3,
    name: "Aisha Patel",
    title: "Content Writer & Marketing Specialist",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviews: 156,
    hourlyRate: 45,
    location: "London, UK",
    verified: true,
    topRated: true,
    skills: ["Content Writing", "SEO", "Social Media", "Email Marketing", "Copywriting"],
    description:
      "Strategic content creator with expertise in blockchain and tech industries. Proven track record of driving engagement and conversions.",
    completedJobs: 134,
    successRate: 99,
    responseTime: "30 minutes",
    languages: ["English", "Hindi", "French"],
    category: "writing",
    availability: "Available now",
    portfolio: [
      { title: "Blockchain Blog Series", image: "/placeholder.svg?height=200&width=300" },
      { title: "DeFi Marketing Campaign", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: 4,
    name: "David Kim",
    title: "Mobile App Developer",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.7,
    reviews: 73,
    hourlyRate: 70,
    location: "Seoul, South Korea",
    verified: true,
    topRated: false,
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    description:
      "Mobile development specialist with 4+ years of experience building cross-platform applications for startups and enterprises.",
    completedJobs: 52,
    successRate: 94,
    responseTime: "3 hours",
    languages: ["English", "Korean"],
    category: "mobile-dev",
    availability: "Available in 1 week",
    portfolio: [
      { title: "Fitness Tracking App", image: "/placeholder.svg?height=200&width=300" },
      { title: "E-commerce Mobile App", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: 5,
    name: "Elena Volkov",
    title: "Data Scientist & AI Engineer",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviews: 41,
    hourlyRate: 95,
    location: "Berlin, Germany",
    verified: true,
    topRated: true,
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "AI"],
    description:
      "PhD in Computer Science with expertise in machine learning and artificial intelligence. Specialized in building predictive models and data pipelines.",
    completedJobs: 28,
    successRate: 100,
    responseTime: "4 hours",
    languages: ["English", "German", "Russian"],
    category: "data",
    availability: "Available now",
    portfolio: [
      { title: "Predictive Analytics Dashboard", image: "/placeholder.svg?height=200&width=300" },
      { title: "AI Chatbot System", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: 6,
    name: "James Thompson",
    title: "Blockchain Developer & Smart Contract Auditor",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    reviews: 62,
    hourlyRate: 120,
    location: "Toronto, Canada",
    verified: true,
    topRated: true,
    skills: ["Solidity", "Web3", "Smart Contracts", "DeFi", "Security Auditing"],
    description:
      "Senior blockchain developer with extensive experience in DeFi protocols and smart contract security. Former security researcher at major crypto firms.",
    completedJobs: 45,
    successRate: 97,
    responseTime: "2 hours",
    languages: ["English", "French"],
    category: "blockchain",
    availability: "Available in 3 days",
    portfolio: [
      { title: "DeFi Lending Protocol", image: "/placeholder.svg?height=200&width=300" },
      { title: "NFT Staking Platform", image: "/placeholder.svg?height=200&width=300" },
    ],
  },
]

interface Freelancer {
  _id: string;
  fullname: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  verified: boolean;
  topRated: boolean;
  skills: string[];
  description: string;
  completedJobs: number;
  successRate: number;
  responseTime: string;
  languages: string[];
  category: string;
  availability: string;
  portfolio: {
    title: string;
    description?: string;
    image: string;
    url?: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const categoryIcons: Record<string, any> = {
  'all': Globe,
  'web-dev': Code,
  'mobile-dev': Smartphone,
  'design': Palette,
  'writing': PenTool,
  'marketing': Megaphone,
  'data': BarChart,
  'photography': Camera,
  'blockchain': Shield,
  'other': Target,
};

export default function FreelancersPage() {
  const { user, isAuthenticated } = useAuth();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/freelancers/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch freelancers
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
        });
        
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        if (minRate) params.append('minRate', minRate);
        if (maxRate) params.append('maxRate', maxRate);
        if (verifiedOnly) params.append('verified', 'true');
        if (topRatedOnly) params.append('topRated', 'true');
        if (selectedAvailability) params.append('availability', selectedAvailability);
        
        const response = await fetch(`/api/freelancers?${params}`);
        if (!response.ok) throw new Error('Failed to fetch freelancers');
        
        const data = await response.json();
        setFreelancers(data.freelancers);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        setError('Failed to load freelancers. Please try again.');
        console.error('Error fetching freelancers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFreelancers();
  }, [selectedCategory, searchTerm, minRate, maxRate, verifiedOnly, topRatedOnly, selectedAvailability, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, minRate, maxRate, verifiedOnly, topRatedOnly, selectedAvailability]);

  // Remove the entire mock freelancers array (lines 54-205)

interface Freelancer {
  _id: string;
  fullname: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  verified: boolean;
  topRated: boolean;
  skills: string[];
  description: string;
  completedJobs: number;
  successRate: number;
  responseTime: string;
  languages: string[];
  category: string;
  availability: string;
  portfolio: {
    title: string;
    description?: string;
    image: string;
    url?: string;
  }[];
}

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || freelancer.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return a.hourlyRate - b.hourlyRate
      case "price-high":
        return b.hourlyRate - a.hourlyRate
      case "reviews":
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Top <span className="text-blue-200">Verified</span> Freelancers
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Connect with skilled professionals from around the world. All freelancers are verified and rated by our
              community.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search freelancers by name, skill, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg border-slate-200 focus:border-blue-500"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-64 h-12 border-slate-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const IconComponent = categoryIcons[category.id] || Target;
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {category.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 px-8"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-slate-600 font-medium">Verified Freelancers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">98.5%</div>
              <div className="text-slate-600 font-medium">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">Support Available</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">2.1h</div>
              <div className="text-slate-600 font-medium">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.slice(1).map((category) => {
              const IconComponent = categoryIcons[category.id] || Target;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-blue-500 text-white scale-105 shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs opacity-75">{category.count} freelancers</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-semibold text-slate-800">{sortedFreelancers.length} freelancers found</h3>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="sort" className="text-sm font-medium text-slate-600">
                Sort by:
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Freelancers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFreelancers.map((freelancer) => (
              <Card
                key={freelancer._id}
                className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-16 h-16 ring-2 ring-blue-100">
                          <AvatarImage src={freelancer.avatar || "/placeholder.svg"} alt={freelancer.fullname} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold text-lg">
                            {freelancer.fullname
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {freelancer.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {freelancer.fullname}
                          </h3>
                          {freelancer.topRated && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Top Rated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">{freelancer.title}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-slate-700">{freelancer.rating}</span>
                            <span className="text-sm text-slate-500">({freelancer.reviewCount})</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{freelancer.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{freelancer.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {(freelancer.skills || []).slice(0, 4).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {(freelancer.skills?.length || 0) > 4 && (
                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                        +{(freelancer.skills?.length || 0) - 4} more
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-slate-800">${freelancer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-600">{freelancer.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <span className="text-slate-600">{freelancer.completedJobs} jobs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600">{freelancer.successRate}% success</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          freelancer.availability === "Available now" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-sm text-slate-600">{freelancer.availability}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFreelancer(freelancer)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        View Profile
                      </Button>
                      {isAuthenticated && user?.role === "client" && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8 py-3 border-blue-200 text-blue-600 hover:bg-blue-50">
              Load More Freelancers
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have found their perfect freelancer match on FreeLanceDAO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/signup/client">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                    <Users className="w-5 h-5 mr-2" />
                    Join as Client
                  </Button>
                </Link>
                <Link href="/auth/signup/freelancer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Become a Freelancer
                  </Button>
                </Link>
              </>
            ) : user?.role === "client" ? (
              <Link href="/post-job">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                  <Zap className="w-5 h-5 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            ) : (
              <Link href="/jobs">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Find Work Opportunities
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Freelancer Profile Modal */}
      <Dialog open={!!selectedFreelancer} onOpenChange={() => setSelectedFreelancer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFreelancer && (
            <>
              <DialogHeader>
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                      <AvatarImage
                        src={selectedFreelancer.avatar || "/placeholder.svg"}
                        alt={selectedFreelancer.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold text-xl">
                        {selectedFreelancer.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {selectedFreelancer.verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <DialogTitle className="text-2xl">{selectedFreelancer.fullname}</DialogTitle>
                      {selectedFreelancer.topRated && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
                          <Award className="w-4 h-4 mr-1" />
                          Top Rated
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="text-lg font-medium text-slate-700 mb-3">
                      {selectedFreelancer.title}
                    </DialogDescription>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedFreelancer.rating}</span>
                        <span className="text-slate-500">({selectedFreelancer.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{selectedFreelancer.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">${selectedFreelancer.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">About</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedFreelancer.description}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreelancer.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedFreelancer.completedJobs}</div>
                      <div className="text-sm text-slate-600">Jobs Completed</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedFreelancer.successRate}%</div>
                      <div className="text-sm text-slate-600">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedFreelancer.responseTime}</div>
                      <div className="text-sm text-slate-600">Response Time</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{selectedFreelancer.languages.length}</div>
                      <div className="text-sm text-slate-600">Languages</div>
                    </div>
                  </div>
                </div>

                {/* Portfolio */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Portfolio</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedFreelancer.portfolio.map((item: any, index: number) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-medium text-slate-800">{item.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {isAuthenticated && user?.role === "client" && (
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Save</span>
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Freelancer</span>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
