"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  Star,
  Plus,
  Search,
  CheckCircle,
  Users,
  FolderOpen,
  TrendingUp,
  Award,
  Bell,
  ChevronDown,
  Bot,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { HederaWalletConnect } from "./hedera-wallet-connect"

export function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isWalletConnected, signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  // Navigation items for unauthenticated users
  const publicNavigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Browse Jobs", icon: Search },
    { href: "/freelancers", label: "Find Talent", icon: Users },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
  ]

  // Navigation items for freelancers
  const freelancerNavigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Find Work", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { href: "/reputation", label: "Reputation", icon: Star },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
  ]

  // Navigation items for clients
  const clientNavigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/post-job", label: "Post Job", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/projects", label: "My Projects", icon: FolderOpen },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
  ]

  const getNavigationItems = () => {
    if (!isAuthenticated) return publicNavigationItems
    return user?.role === "freelancer" ? freelancerNavigationItems : clientNavigationItems
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/freelancedao-logo.png"
                  alt="FreeLanceDAO"
                  width={40}
                  height={40}
                  className="rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                  FreeLanceDAO
                </span>
                <div className="text-xs text-slate-500 font-medium">Decentralized Freelancing</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 relative ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-600 scale-105 shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive(item.href) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications for authenticated users */}
              {isAuthenticated && (
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="relative group">
                    <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-xs animate-bounce shadow-lg">
                      2
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* Wallet Connect Button for authenticated users */}
              {isAuthenticated && (
                <DropdownMenu open={showWalletConnect} onOpenChange={setShowWalletConnect}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`hidden sm:flex items-center space-x-2 transition-all duration-200 ${
                        isWalletConnected
                          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>{isWalletConnected ? "Connected" : "Connect Wallet"}</span>
                      {isWalletConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Hedera Wallet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <HederaWalletConnect onConnectionChange={() => setShowWalletConnect(false)} />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu or Auth Buttons */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100 px-3 py-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                        <div className="flex items-center space-x-1">
                          {user?.isVerified && <CheckCircle className="w-3 h-3 text-green-500" />}
                          <span className="text-xs text-slate-500 capitalize">
                            {user?.role} {user?.isVerified ? "• Verified" : "• Unverified"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="flex items-center space-x-3 p-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-xs text-slate-500">{user?.email}</div>
                        <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span>{user?.profile?.rating || 0} Rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-3 h-3 text-blue-500" />
                            <span>
                              {user?.role === "freelancer"
                                ? `${user?.profile?.completedJobs || 0} Jobs`
                                : `${user?.profile?.projectsPosted || 0} Projects`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "freelancer" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/reputation" className="flex items-center">
                            <Star className="w-4 h-4 mr-3" />
                            Reputation
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/ai-agents/dashboard" className="flex items-center">
                            <Bot className="w-4 h-4 mr-3" />
                            AI Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign In</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Choose Your Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signin/freelancer" className="flex items-center">
                          <Search className="w-4 h-4 mr-3 text-blue-500" />
                          <div>
                            <div className="font-medium">Sign In as Freelancer</div>
                            <div className="text-xs text-slate-500">Find work and build your career</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signin/client" className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-3 text-green-500" />
                          <div>
                            <div className="font-medium">Sign In as Client</div>
                            <div className="text-xs text-slate-500">Hire talent for your projects</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Get Started</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Join FreeLanceDAO</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup/freelancer" className="flex items-center">
                          <Search className="w-4 h-4 mr-3 text-blue-500" />
                          <div>
                            <div className="font-medium">Join as Freelancer</div>
                            <div className="text-xs text-slate-500">Offer your skills to clients</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup/client" className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-3 text-green-500" />
                          <div>
                            <div className="font-medium">Join as Client</div>
                            <div className="text-xs text-slate-500">Find and hire top talent</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-600"
                        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">{item.badge}</Badge>
                    )}
                  </Button>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
                  <div className="text-sm font-medium text-slate-700 mb-2">Sign In</div>
                  <Link href="/auth/signin/freelancer" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Search className="w-4 h-4 mr-3" />
                      Sign In as Freelancer
                    </Button>
                  </Link>
                  <Link href="/auth/signin/client" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-600 hover:text-green-600 hover:bg-green-50"
                    >
                      <Briefcase className="w-4 h-4 mr-3" />
                      Sign In as Client
                    </Button>
                  </Link>

                  <div className="text-sm font-medium text-slate-700 mb-2 mt-4">Get Started</div>
                  <Link href="/auth/signup/freelancer" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Join as Freelancer
                    </Button>
                  </Link>
                  <Link href="/auth/signup/client" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-600 hover:text-green-600 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Join as Client
                    </Button>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="p-2">
                    <HederaWalletConnect />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export function BottomNavigation() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const isActive = (path: string) => pathname === path

  // Bottom navigation for unauthenticated users
  const publicBottomNav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Jobs", icon: Search },
    { href: "/freelancers", label: "Talent", icon: Users },
    { href: "/ai-agents", label: "AI", icon: Bot },
    { href: "/auth/signin/freelancer", label: "Sign In", icon: User },
  ]

  // Bottom navigation for freelancers
  const freelancerBottomNav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Find Work", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { href: "/ai-agents", label: "AI", icon: Bot },
  ]

  // Bottom navigation for clients
  const clientBottomNav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/post-job", label: "Post Job", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/ai-agents", label: "AI", icon: Bot },
  ]

  const getBottomNavItems = () => {
    if (!isAuthenticated) return publicBottomNav
    return user?.role === "freelancer" ? freelancerBottomNav : clientBottomNav
  }

  const bottomNavItems = getBottomNavItems()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-full w-full rounded-none transition-all duration-200 relative ${
                isActive(item.href)
                  ? "bg-blue-100 text-blue-600 scale-105"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-bounce">
                  {item.badge}
                </Badge>
              )}
              {isActive(item.href) && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-b-full" />
              )}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}
