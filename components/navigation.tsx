"use client"

import { useState, useEffect } from "react"
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
  Users,
  FolderOpen,
  TrendingUp,
  Award,
  Bell,
  ChevronDown,
  Bot,
  Building2,
  Vote,
  Gavel,
  Coins,
  Newspaper,
  Sparkles,
  Shield,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@/lib/wallet-context"
import { SidebarNavigation } from "./sidebar-navigation"
import dynamic from "next/dynamic"

// Dynamically import HashpackConnect and disable SSR
const HashpackConnect = dynamic(
  () =>
    import("@/components/HashpackConnect").then(
      (mod: any) => mod?.default ?? mod?.HashpackConnect ?? mod
    ),
  { ssr: false, loading: () => <div style={{ width: 24, height: 24 }} /> }
)

type NavigationItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  subItems?: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

export function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()
  const { isConnected, account } = useWallet() // Use wallet context

  const isActive = (path: string) => pathname === path

  const publicNavigationItems: NavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Browse Jobs", icon: Search },
    { href: "/freelancers", label: "Find Talent", icon: Users },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
    {
      href: "/dao",
      label: "DAO",
      icon: Building2,
      subItems: [
        { name: "Proposals", href: "/dao/proposals", icon: Vote },
        { name: "Disputes", href: "/dao/disputes", icon: Gavel },
        { name: "Staking", href: "/dao/staking", icon: Coins },
        { name: "News", href: "/dao/news", icon: Newspaper },
      ],
    },
  ]

  const freelancerNavigationItems: NavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Find Work", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { href: "/reputation", label: "Reputation", icon: Star },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
    {
      href: "/dao",
      label: "DAO",
      icon: Building2,
      subItems: [
        { name: "Proposals", href: "/dao/proposals", icon: Vote },
        { name: "Disputes", href: "/dao/disputes", icon: Gavel },
        { name: "Staking", href: "/dao/staking", icon: Coins },
        { name: "News", href: "/dao/news", icon: Newspaper },
      ],
    },
  ]

  const clientNavigationItems: NavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/post-job", label: "Post Job", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/projects", label: "My Projects", icon: FolderOpen },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/ai-agents", label: "AI Agents", icon: Bot },
    {
      href: "/dao",
      label: "DAO",
      icon: Building2,
      subItems: [
        { name: "Proposals", href: "/dao/proposals", icon: Vote },
        { name: "Disputes", href: "/dao/disputes", icon: Gavel },
        { name: "Staking", href: "/dao/staking", icon: Coins },
        { name: "News", href: "/dao/news", icon: Newspaper },
      ],
    },
  ]

  const getNavigationItems = () => {
    if (!isAuthenticated) return publicNavigationItems
    return user?.role === "freelancer"
      ? freelancerNavigationItems
      : clientNavigationItems
  }

  const navigationItems = getNavigationItems()

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0)
        return
      }
      try {
        const token = localStorage.getItem("freelancedao_token")
        if (!token) return
        const response = await fetch("/api/notifications?unread=true&limit=1", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 300000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleDropdownToggle = (href: string) => {
    setOpenDropdown(prev => (prev === href ? null : href))
  }

  return (
    <>
      {isAuthenticated && (
        <SidebarNavigation
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <nav
        className="border-b border-[#AE16A7]/30 sticky top-0 z-50 backdrop-blur-md shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: "#1D0225" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1D0225] via-[#AE16A7]/5 to-[#1D0225]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center space-x-2 md:space-x-3 group relative flex-shrink-0"
            >
              <div className="relative">
                <Image
                  src="/images/freelancedao-logo.png"
                  alt="FreeLanceDAO"
                  width={36}
                  height={36}
                  className="md:w-10 md:h-10 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10 border border-[#AE16A7]/20"
                />
              </div>
              <div className="hidden sm:block">
                <span
                  className="text-lg md:text-xl font-bold group-hover:scale-105 transition-all duration-300 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #FF068D, #AE16A7, #FA5F04)",
                  }}
                >
                  FreeLanceDAO
                </span>
              </div>
            </Link>

            {!isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1 relative flex-1 justify-center max-w-2xl">
                {navigationItems.map((item, index) =>
                  item.subItems ? (
                    <div key={item.href} className="relative">
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 rounded-xl ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30"
                            : ""
                        }`}
                        onClick={() => handleDropdownToggle(item.href)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            openDropdown === item.href ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                      {openDropdown === item.href && (
                        <div
                          className={`absolute mt-3 w-56 border border-[#AE16A7]/30 rounded-xl shadow-2xl z-[9999] backdrop-blur-md overflow-hidden ${
                            index >= navigationItems.length - 2
                              ? "right-0"
                              : "left-0"
                          }`}
                          style={{ backgroundColor: "#1D0225" }}
                        >
                          {item.subItems.map(sub => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="flex items-center px-5 py-4 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20">
                                <sub.icon className="w-5 h-5 mr-4 text-[#FA5F04]" />
                                <span>{sub.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 rounded-xl ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30"
                            : ""
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              {isAuthenticated && (
                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative group text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 p-2 md:p-3 rounded-xl"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-[#FF068D] to-[#FA5F04] text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              <div className="hidden sm:block">
                <HashpackConnect />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 px-2 md:px-3 py-2 text-white rounded-xl"
                    >
                      <Avatar className="w-8 h-8 border-2 border-[#AE16A7]/50">
                        <AvatarFallback className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D]">
                          {user?.name
                            ?.split(" ")
                            .map(n => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-[#AE16A7]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
                    style={{ backgroundColor: "#1D0225" }}
                  >
                    <DropdownMenuLabel className="p-3">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-slate-500">
                        {user?.email}
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
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 rounded-xl"
                      >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign In</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
                      style={{ backgroundColor: "#1D0225" }}
                    >
                      <DropdownMenuLabel>Choose Your Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signin/freelancer"
                          className="hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20"
                        >
                          Sign In as Freelancer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signin/client"
                          className="hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20"
                        >
                          Sign In as Client
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] hover:from-[#AE16A7]/80 hover:to-[#FF068D]/80 flex items-center space-x-2 rounded-xl">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Get Started</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
                      style={{ backgroundColor: "#1D0225" }}
                    >
                      <DropdownMenuLabel>Join FreeLanceDAO</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signup/freelancer"
                          className="hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20"
                        >
                          Join as Freelancer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signup/client"
                          className="hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20"
                        >
                          Join as Client
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 p-2 md:p-3 rounded-xl"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsSidebarOpen(!isSidebarOpen)
                  } else {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }
                }}
              >
                {(isAuthenticated ? isSidebarOpen : isMobileMenuOpen) ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 rounded-xl"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isAuthenticated && isMobileMenuOpen && (
          <div
            className="lg:hidden border-t border-[#AE16A7]/30 shadow-2xl backdrop-blur-md"
            style={{ backgroundColor: "#1D0225" }}
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-3">
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start py-4 rounded-xl ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30 text-white"
                        : "text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
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

  type BottomNavigationItem = {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
  }

  const publicBottomNav: BottomNavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Jobs", icon: Search },
    { href: "/freelancers", label: "Talent", icon: Users },
    { href: "/ai-agents", label: "AI", icon: Bot },
    { href: "/auth/signin/freelancer", label: "Sign In", icon: User },
  ]

  const freelancerBottomNav: BottomNavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Find Work", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { href: "/ai-agents", label: "AI", icon: Bot },
  ]

  const clientBottomNav: BottomNavigationItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/post-job", label: "Post Job", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/ai-agents", label: "AI", icon: Bot },
  ]

  const getBottomNavItems = () => {
    if (!isAuthenticated) return publicBottomNav
    return user?.role === "freelancer"
      ? freelancerBottomNav
      : clientBottomNav
  }

  const bottomNavItems = getBottomNavItems()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[#AE16A7]/30 z-50 shadow-2xl backdrop-blur-md"
      style={{ backgroundColor: "#1D0225" }}
    >
      <div className="grid grid-cols-5 h-20">
        {bottomNavItems.slice(0, 5).map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-full w-full rounded-none ${
                isActive(item.href)
                  ? "bg-gradient-to-b from-[#AE16A7]/30 text-white"
                  : "text-[#AE16A7] hover:text-white"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${
                  isActive(item.href) ? "text-[#FF068D]" : ""
                }`}
              />
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}