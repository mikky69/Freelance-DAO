"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Clock, DollarSign, Star, X } from "lucide-react"
import { useState } from "react"

export interface SearchFilters {
  query: string
  category: string
  budgetRange: [number, number]
  duration: string
  experienceLevel: string
  location: string
  skills: string[]
  clientRating: number
  projectType: string
  urgency: string
  verified: boolean
  featured: boolean
}

export interface SearchResult {
  id: string
  type: "job" | "freelancer"
  title: string
  description: string
  budget?: string
  hourlyRate?: string
  skills: string[]
  rating: number
  location: string
  verified: boolean
  featured: boolean
  matchScore: number
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters, results: SearchResult[]) => void
  initialFilters?: Partial<SearchFilters>
}

export function AdvancedSearch({ onSearch, initialFilters }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("jobs")
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    budgetRange: [0, 10000],
    duration: "all",
    experienceLevel: "all",
    location: "",
    skills: [],
    clientRating: 0,
    projectType: "all",
    urgency: "all",
    verified: false,
    featured: false,
    ...initialFilters,
  })

  const [availableSkills] = useState([
    "React",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "UI/UX Design",
    "Figma",
    "Photoshop",
    "Content Writing",
    "SEO",
    "Digital Marketing",
    "Blockchain",
    "Smart Contracts",
    "Solidity",
    "Web3",
    "DeFi",
  ])

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "job",
      title: "Full-Stack React Developer Needed",
      description: "Looking for an experienced React developer to build a modern web application...",
      budget: "$2,500 - $5,000",
      skills: ["React", "Node.js", "TypeScript"],
      rating: 4.8,
      location: "Remote",
      verified: true,
      featured: true,
      matchScore: 95,
    },
    {
      id: "2",
      type: "freelancer",
      title: "Sarah Johnson - Senior UI/UX Designer",
      description: "Experienced designer with 5+ years in creating beautiful, user-friendly interfaces...",
      hourlyRate: "$75/hour",
      skills: ["UI/UX Design", "Figma", "Prototyping"],
      rating: 4.9,
      location: "San Francisco, CA",
      verified: true,
      featured: false,
      matchScore: 88,
    },
    {
      id: "3",
      type: "job",
      title: "Smart Contract Developer for DeFi Project",
      description: "Seeking blockchain developer for innovative DeFi platform on Hedera...",
      budget: "$5,000 - $10,000",
      skills: ["Solidity", "Smart Contracts", "DeFi", "Hedera"],
      rating: 4.7,
      location: "Remote",
      verified: true,
      featured: true,
      matchScore: 92,
    },
  ]

  const performSearch = async () => {
    setIsSearching(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Filter mock results based on current filters
    const filtered = mockResults.filter((result) => {
      if (activeTab === "jobs" && result.type !== "job") return false
      if (activeTab === "freelancers" && result.type !== "freelancer") return false

      if (
        filters.query &&
        !result.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !result.description.toLowerCase().includes(filters.query.toLowerCase())
      ) {
        return false
      }

      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some((skill) =>
          result.skills.some((resultSkill) => resultSkill.toLowerCase().includes(skill.toLowerCase())),
        )
        if (!hasMatchingSkill) return false
      }

      if (filters.verified && !result.verified) return false
      if (filters.featured && !result.featured) return false

      return true
    })

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore)

    setSearchResults(filtered)
    setIsSearching(false)
    onSearch(filters, filtered)
  }

  const addSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
    }
  }

  const removeSkill = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const resetFilters = () => {
    setFilters({
      query: "",
      category: "all",
      budgetRange: [0, 10000],
      duration: "all",
      experienceLevel: "all",
      location: "",
      skills: [],
      clientRating: 0,
      projectType: "all",
      urgency: "all",
      verified: false,
      featured: false,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="w-4 h-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Find exactly what you're looking for with powerful filters and AI-powered matching
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Search Jobs</TabsTrigger>
            <TabsTrigger value="freelancers">Find Freelancers</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Search</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="query">Search Query</Label>
                    <Input
                      id="query"
                      placeholder="Enter keywords, job titles, or descriptions..."
                      value={filters.query}
                      onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="City, state, or 'Remote'"
                      value={filters.location}
                      onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Budget Range (HBAR)</Label>
                    <div className="px-2 py-4">
                      <Slider
                        value={filters.budgetRange}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, budgetRange: value as [number, number] }))
                        }
                        max={10000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-2">
                        <span>{filters.budgetRange[0]} HBAR</span>
                        <span>{filters.budgetRange[1]} HBAR</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Project Duration</Label>
                    <Select
                      value={filters.duration}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Duration</SelectItem>
                        <SelectItem value="short">Less than 1 month</SelectItem>
                        <SelectItem value="medium">1-3 months</SelectItem>
                        <SelectItem value="long">3+ months</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Experience Level</Label>
                    <Select
                      value={filters.experienceLevel}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Level</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verified}
                        onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, verified: !!checked }))}
                      />
                      <Label htmlFor="verified">Verified clients only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.featured}
                        onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, featured: !!checked }))}
                      />
                      <Label htmlFor="featured">Featured jobs only</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant={filters.skills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => (filters.skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
                      >
                        {skill}
                        {filters.skills.includes(skill) && <X className="w-3 h-3 ml-1" />}
                      </Button>
                    ))}
                  </div>
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-slate-600">Selected:</span>
                      {filters.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="freelancers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Freelancer Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find Freelancers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="freelancer-query">Search Query</Label>
                    <Input
                      id="freelancer-query"
                      placeholder="Skills, name, or specialization..."
                      value={filters.query}
                      onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Minimum Rating</Label>
                    <Select
                      value={filters.clientRating.toString()}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, clientRating: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="5">5 Stars Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="City, state, or 'Remote'"
                      value={filters.location}
                      onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Freelancer Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Freelancer Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hourly Rate Range (HBAR)</Label>
                    <div className="px-2 py-4">
                      <Slider
                        value={filters.budgetRange}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, budgetRange: value as [number, number] }))
                        }
                        max={200}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-2">
                        <span>{filters.budgetRange[0]} HBAR/hr</span>
                        <span>{filters.budgetRange[1]} HBAR/hr</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Experience Level</Label>
                    <Select
                      value={filters.experienceLevel}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Level</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified-freelancer"
                      checked={filters.verified}
                      onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, verified: !!checked }))}
                    />
                    <Label htmlFor="verified-freelancer">Verified freelancers only</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills for Freelancers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Button
                      key={skill}
                      variant={filters.skills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => (filters.skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
                    >
                      {skill}
                      {filters.skills.includes(skill) && <X className="w-3 h-3 ml-1" />}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Search Results Preview */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-800">{result.title}</h4>
                        <Badge className="bg-green-100 text-green-700 text-xs">{result.matchScore}% match</Badge>
                        {result.verified && <Badge className="bg-blue-100 text-blue-700 text-xs">Verified</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{result.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {result.rating}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {result.location}
                        </span>
                        {result.budget && (
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {result.budget}
                          </span>
                        )}
                        {result.hourlyRate && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {result.hourlyRate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={performSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
