"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	Building2,
	Vote,
	Gavel,
	Coins,
	Newspaper,
	Sparkles,
	Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { MultiWalletConnect } from "./multi-wallet-connect";
import { SidebarNavigation } from "./sidebar-navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { walletManager } from "@/lib/hedera-wallet";
import { CustomHederaConnectButton } from "./CustomHederaConnectButton";
import { useAccount } from "wagmi";

type NavigationItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: number;
	subItems?: {
		name: string;
		href: string;
		icon: React.ComponentType<{ className?: string }>;
	}[];
};

export function TopNavigation() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showWalletConnect, setShowWalletConnect] = useState(false);
	const [showWalletDialog, setShowWalletDialog] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [walletBalance, setWalletBalance] = useState<string | null>(null);
	const [isBalanceLoading, setIsBalanceLoading] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const pathname = usePathname();
	const { user, isAuthenticated, signOut, disconnectWallet } = useAuth();
	const { isConnected, address } = useAccount();

	const maskAddress = (address: string) => {
		if (!address) return "";
		if (address.length <= 11) return address;
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const getHederaBalance = async () => {
		const bal = await walletManager.refreshBalance();
		return bal;
	};

	const isActive = (path: string) => pathname === path;

	// Navigation items for unauthenticated users
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
	];

	// Navigation items for freelancers
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
	];

	// Navigation items for clients
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
	];

	const getNavigationItems = () => {
		if (!isAuthenticated) return publicNavigationItems;
		return user?.role === "freelancer"
			? freelancerNavigationItems
			: clientNavigationItems;
	};

	const navigationItems = getNavigationItems();

	// Fetch unread notification count
	useEffect(() => {
		const fetchUnreadCount = async () => {
			if (!isAuthenticated) {
				setUnreadCount(0);
				return;
			}

			try {
				const token = localStorage.getItem("freelancedao_token");
				if (!token) return;

				const response = await fetch("/api/notifications?unread=true&limit=1", {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					const data = await response.json();
					setUnreadCount(data.unreadCount || 0);
				}
			} catch (error) {
				console.error("Error fetching unread count:", error);
			}
		};

		fetchUnreadCount();

		// Refresh count every 300 seconds
		const interval = setInterval(fetchUnreadCount, 300000);
		return () => clearInterval(interval);
	}, [isAuthenticated]);

	const handleDropdownToggle = (href: string) => {
		setOpenDropdown((prev) => (prev === href ? null : href));
	};

	// Fetch balance when dropdown opens and wallet is connected
	useEffect(() => {
		if (isConnected && address) {
			setIsBalanceLoading(true);
			getHederaBalance().then((bal) => {
				setWalletBalance(bal);
				setIsBalanceLoading(false);
			});
		} else {
			setWalletBalance(null);
		}
		// Only run when wallet connection changes
	}, [isConnected, address]);

	return (
		<>
			{/* Sidebar Navigation for authenticated users */}
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
				{/* Enhanced Background gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-[#1D0225] via-[#AE16A7]/5 to-[#1D0225]"></div>

				{/* Animated background patterns */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 left-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-[#AE16A7]/40 to-[#FF068D]/40 blur-xl animate-pulse"></div>
					<div className="absolute top-0 right-10 w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#FA5F04]/40 to-[#FF068D]/40 blur-xl animate-pulse delay-1000"></div>
					<div className="absolute top-2 left-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#FF068D]/30 to-transparent blur-lg animate-bounce delay-500"></div>
				</div>

				{/* Decorative elements */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#AE16A7] via-[#FF068D] to-transparent opacity-50"></div>
					<div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#FA5F04] via-[#FF068D] to-transparent opacity-50"></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Enhanced Logo */}
						<Link
							href="/"
							className="flex items-center space-x-2 md:space-x-3 group relative flex-shrink-0"
						>
							<div className="relative">
								<div className="absolute -inset-2 bg-gradient-to-r from-[#AE16A7] via-[#FF068D] to-[#FA5F04] rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300 animate-pulse"></div>
								<Image
									src="/images/freelancedao-logo.png"
									alt="FreeLanceDAO"
									width={36}
									height={36}
									className="md:w-10 md:h-10 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10 border border-[#AE16A7]/20"
								/>
								<Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#FF068D] animate-spin opacity-70" />
							</div>
							<div className="hidden sm:block">
								<span
									className="text-lg md:text-xl font-bold group-hover:scale-105 transition-all duration-300 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg"
									style={{
										backgroundImage:
											"linear-gradient(45deg, #FF068D, #AE16A7, #FA5F04)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
									}}
								>
									FreeLanceDAO
								</span>
								<div className="text-xs text-[#AE16A7]/70 font-medium tracking-wider">
									Decentralized Freelancing
								</div>
							</div>
						</Link>

						{/* Enhanced Desktop Navigation */}
						{!isAuthenticated && (
							<div className="hidden lg:flex items-center space-x-1 relative flex-1 justify-center max-w-2xl">
								{navigationItems.map((item, index) =>
									item.subItems ? (
										<div key={item.href} className="relative">
											<Button
												variant="ghost"
												className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:shadow-lg hover:shadow-[#AE16A7]/20 border border-transparent hover:border-[#AE16A7]/30 rounded-xl ${
													isActive(item.href)
														? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30 text-white scale-105 shadow-xl shadow-[#AE16A7]/30 border-[#AE16A7]/50"
														: "hover:text-white"
												}`}
												onClick={() => handleDropdownToggle(item.href)}
											>
												<item.icon className="w-4 h-4" />
												<span className="font-semibold text-sm">
													{item.label}
												</span>
												<ChevronDown
													className={`w-4 h-4 transition-transform duration-300 ${
														openDropdown === item.href ? "rotate-180" : ""
													}`}
												/>
												{isActive(item.href) && (
													<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#FF068D] rounded-full animate-pulse shadow-lg shadow-[#FF068D]/50" />
												)}
											</Button>
											{openDropdown === item.href && (
												<div
													className={`absolute mt-3 w-56 border border-[#AE16A7]/30 rounded-xl shadow-2xl z-[9999] backdrop-blur-md overflow-hidden ${
														index >= navigationItems.length - 2 ? 'right-0' : 'left-0'
													}`}
													style={{ backgroundColor: "#1D0225" }}
												>
													<div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10"></div>
													{item.subItems.map((sub, index) => (
														<Link key={sub.href} href={sub.href} onClick={() => setOpenDropdown(null)}>
															<div className="flex items-center px-5 py-4 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 cursor-pointer transition-all duration-300 relative group border-b border-[#AE16A7]/10 last:border-b-0">
																<sub.icon className="w-5 h-5 mr-4 text-[#FA5F04] group-hover:scale-110 transition-transform duration-300" />
																<span
																	className="font-semibold bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
																	style={{
																		backgroundImage:
																			"linear-gradient(45deg, #FF068D, #AE16A7)",
																		WebkitBackgroundClip: "text",
																		WebkitTextFillColor: "transparent",
																	}}
																>
																	{sub.name}
																</span>
																<Sparkles className="w-3 h-3 ml-auto text-[#FF068D]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
												className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:shadow-lg hover:shadow-[#AE16A7]/20 border border-transparent hover:border-[#AE16A7]/30 rounded-xl ${
													isActive(item.href)
														? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30 text-white scale-105 shadow-xl shadow-[#AE16A7]/30 border-[#AE16A7]/50"
														: "hover:text-white"
												}`}
											>
												<item.icon className="w-4 h-4" />
												<span className="font-semibold text-sm">
													{item.label}
												</span>
												{isActive(item.href) && (
													<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#FF068D] rounded-full animate-pulse shadow-lg shadow-[#FF068D]/50" />
												)}
											</Button>
										</Link>
									)
								)}
							</div>
						)}

						{/* Enhanced Right Side Actions */}
						<div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
							{/* Enhanced Notifications */}
							{isAuthenticated && (
								<Link href="/notifications">
									<Button
										variant="ghost"
										size="sm"
										className="relative group text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 p-2 md:p-3 rounded-xl border border-transparent hover:border-[#AE16A7]/30 hover:shadow-lg hover:shadow-[#AE16A7]/20 transition-all duration-300"
									>
										<Bell className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
										{unreadCount > 0 && (
											<Badge className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center bg-gradient-to-r from-[#FF068D] to-[#FA5F04] text-white text-xs font-bold animate-bounce shadow-lg shadow-[#FF068D]/50 border-2 border-white">
												{unreadCount > 99 ? "99+" : unreadCount}
											</Badge>
										)}
									</Button>
								</Link>
							)}

							{/* Enhanced Wallet Connection */}
							<div className="hidden sm:block">
								<div className="relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-[#AE16A7] to-[#FF068D] rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
									<CustomHederaConnectButton />
								</div>
							</div>

							{/* Enhanced User Menu */}
							{isAuthenticated ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="flex items-center space-x-2 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 px-2 md:px-3 py-2 text-white rounded-xl border border-transparent hover:border-[#AE16A7]/30 hover:shadow-lg hover:shadow-[#AE16A7]/20 transition-all duration-300"
										>
											<Avatar className="w-7 h-7 md:w-8 md:h-8 border-2 border-[#AE16A7]/50 shadow-lg">
												<AvatarFallback className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] text-white font-bold text-sm">
													{user?.name
														?.split(" ")
														.map((n) => n[0])
														.join("") || "U"}
												</AvatarFallback>
											</Avatar>
											<div className="hidden md:block text-left">
												<div className="flex items-center space-x-2">
													{user?.isVerified && (
														<Shield className="w-3 h-3 text-[#FA5F04]" />
													)}
													<span className="text-xs text-[#AE16A7] font-semibold capitalize">
														{user?.role}
													</span>
													<div
														className={`w-2 h-2 rounded-full ${
															user?.isVerified ? "bg-[#FA5F04]" : "bg-gray-400"
														} animate-pulse`}
													></div>
												</div>
											</div>
											<ChevronDown className="w-4 h-4 text-[#AE16A7]" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-56 md:w-64 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
										style={{ backgroundColor: "#1D0225" }}
									>
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
												<div className="text-xs text-slate-500">
													{user?.email}
												</div>
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
																: `${
																		user?.profile?.projectsPosted || 0
																  } Projects`}
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
													<Link
														href="/reputation"
														className="flex items-center"
													>
														<Star className="w-4 h-4 mr-3" />
														Reputation
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href="/ai-agents/dashboard"
														className="flex items-center"
													>
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
												className="flex items-center space-x-1 md:space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
											>
												<User className="w-4 h-4" />
												<span className="hidden sm:inline font-semibold text-sm">
													Sign In
												</span>
												<ChevronDown className="w-3 h-3" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-56 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
											style={{ backgroundColor: "#1D0225" }}
										>
											<div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10 rounded-xl"></div>
											<DropdownMenuLabel className="relative z-10 text-white font-semibold">
												Choose Your Role
											</DropdownMenuLabel>
											<DropdownMenuSeparator className="border-[#AE16A7]/30" />
											<DropdownMenuItem asChild className="relative z-10">
												<Link
													href="/auth/signin/freelancer"
													className="flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white"
												>
													<Search className="w-4 h-4 mr-3 text-[#FA5F04]" />
													<div>
														<div className="font-medium">
															Sign In as Freelancer
														</div>
														<div className="text-xs text-[#AE16A7]/70">
															Find work and build your career
														</div>
													</div>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild className="relative z-10">
												<Link
													href="/auth/signin/client"
													className="flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white"
												>
													<Briefcase className="w-4 h-4 mr-3 text-[#FA5F04]" />
													<div>
														<div className="font-medium">Sign In as Client</div>
														<div className="text-xs text-[#AE16A7]/70">
															Hire talent for your projects
														</div>
													</div>
												</Link>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] hover:from-[#AE16A7]/80 hover:to-[#FF068D]/80 flex items-center space-x-1 md:space-x-2 shadow-lg shadow-[#AE16A7]/30 rounded-xl border border-[#AE16A7]/50 transition-all duration-300 hover:scale-105 px-2 md:px-3 py-2">
												<Plus className="w-4 h-4" />
												<span className="hidden sm:inline font-semibold text-sm">
													Get Started
												</span>
												<ChevronDown className="w-3 h-3" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-56 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
											style={{ backgroundColor: "#1D0225" }}
										>
											<div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10 rounded-xl"></div>
											<DropdownMenuLabel className="relative z-10 text-white font-semibold">
												Join FreeLanceDAO
											</DropdownMenuLabel>
											<DropdownMenuSeparator className="border-[#AE16A7]/30" />
											<DropdownMenuItem asChild className="relative z-10">
												<Link
													href="/auth/signup/freelancer"
													className="flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white"
												>
													<Search className="w-4 h-4 mr-3 text-[#FA5F04]" />
													<div>
														<div className="font-medium">
															Join as Freelancer
														</div>
														<div className="text-xs text-[#AE16A7]/70">
															Offer your skills to clients
														</div>
													</div>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild className="relative z-10">
												<Link
													href="/auth/signup/client"
													className="flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white"
												>
													<Briefcase className="w-4 h-4 mr-3 text-[#FA5F04]" />
													<div>
														<div className="font-medium">Join as Client</div>
														<div className="text-xs text-[#AE16A7]/70">
															Find and hire top talent
														</div>
													</div>
												</Link>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							)}

							{/* Enhanced Mobile Menu Button */}
							<Button
								variant="ghost"
								size="sm"
								className="lg:hidden text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 p-2 md:p-3 rounded-xl border border-transparent hover:border-[#AE16A7]/30 transition-all duration-300"
								onClick={() => {
									if (isAuthenticated) {
										setIsSidebarOpen(!isSidebarOpen);
									} else {
										setIsMobileMenuOpen(!isMobileMenuOpen);
									}
								}}
							>
								{(isAuthenticated ? isSidebarOpen : isMobileMenuOpen) ? (
									<X className="w-5 h-5" />
								) : (
									<Menu className="w-5 h-5" />
								)}
							</Button>

							{/* Enhanced Menu button for authenticated users on desktop */}
							{isAuthenticated && (
								<Button
									variant="ghost"
									size="sm"
									className="hidden lg:flex text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:shadow-lg hover:shadow-[#AE16A7]/20 border border-transparent hover:border-[#AE16A7]/30 rounded-xl transition-all duration-300 p-2"
									onClick={() => setIsSidebarOpen(true)}
								>
									<Menu className="w-5 h-5" />
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Enhanced Mobile Menu */}
				{!isAuthenticated && isMobileMenuOpen && (
					<div
						className="lg:hidden border-t border-[#AE16A7]/30 shadow-2xl backdrop-blur-md"
						style={{ backgroundColor: "#1D0225" }}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10"></div>
						<div className="max-w-7xl mx-auto px-4 py-6 space-y-3 relative z-10">
							{navigationItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className={`w-full justify-start transition-all duration-300 py-4 rounded-xl border ${
											isActive(item.href)
												? "bg-gradient-to-r from-[#AE16A7]/30 to-[#FF068D]/30 text-white border-[#AE16A7]/50 shadow-lg"
												: "text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border-transparent hover:border-[#AE16A7]/30"
										}`}
									>
										<item.icon className="w-5 h-5 mr-4" />
										<span className="font-semibold">{item.label}</span>
										{item.badge && (
											<Badge className="ml-auto bg-gradient-to-r from-[#FF068D] to-[#FA5F04] text-white text-xs px-2 py-1 font-bold shadow-lg">
												{item.badge}
											</Badge>
										)}
									</Button>
								</Link>
							))}

							{/* Enhanced Auth Sections */}
							<div className="border-t border-[#AE16A7]/30 pt-6 mt-6 space-y-4">
								<div className="text-base font-bold text-[#AE16A7] mb-4 flex items-center">
									<User className="w-5 h-5 mr-2" />
									Sign In
								</div>
								<Link
									href="/auth/signin/freelancer"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
									>
										<Search className="w-4 h-4 mr-3 text-[#FA5F04]" />
										Sign In as Freelancer
									</Button>
								</Link>
								<Link
									href="/auth/signin/client"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
									>
										<Briefcase className="w-4 h-4 mr-3 text-[#FA5F04]" />
										Sign In as Client
									</Button>
								</Link>

								<div className="text-base font-bold text-[#AE16A7] mb-4 mt-6 flex items-center">
									<Plus className="w-5 h-5 mr-2" />
									Get Started
								</div>
								<Link
									href="/auth/signup/freelancer"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
									>
										<Plus className="w-4 h-4 mr-3 text-[#FA5F04]" />
										Join as Freelancer
									</Button>
								</Link>
								<Link
									href="/auth/signup/client"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
									>
										<Plus className="w-4 h-4 mr-3 text-[#FA5F04]" />
										Join as Client
									</Button>
								</Link>
							</div>
						</div>
					</div>
				)}
			</nav>
		</>
	);
}

export function BottomNavigation() {
	const pathname = usePathname();
	const { user, isAuthenticated } = useAuth();

	const isActive = (path: string) => pathname === path;

	// Bottom navigation for unauthenticated users
	const publicBottomNav = [
		{ href: "/", label: "Home", icon: Home },
		{ href: "/jobs", label: "Jobs", icon: Search },
		{ href: "/freelancers", label: "Talent", icon: Users },
		{ href: "/ai-agents", label: "AI", icon: Bot },
		{ href: "/auth/signin/freelancer", label: "Sign In", icon: User },
	];

	// Bottom navigation for freelancers
	const freelancerBottomNav = [
		{ href: "/", label: "Home", icon: Home },
		{ href: "/jobs", label: "Find Work", icon: Search },
		{ href: "/dashboard", label: "Dashboard", icon: Briefcase },
		{ href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
		{ href: "/ai-agents", label: "AI", icon: Bot },
	];

	// Bottom navigation for clients
	const clientBottomNav = [
		{ href: "/", label: "Home", icon: Home },
		{ href: "/post-job", label: "Post Job", icon: Plus },
		{ href: "/dashboard", label: "Dashboard", icon: Briefcase },
		{ href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
		{ href: "/ai-agents", label: "AI", icon: Bot },
	];

	const getBottomNavItems = () => {
		if (!isAuthenticated) return publicBottomNav;
		return user?.role === "freelancer" ? freelancerBottomNav : clientBottomNav;
	};

	const bottomNavItems = getBottomNavItems();

	return (
		<nav
			className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[#AE16A7]/30 z-50 shadow-2xl backdrop-blur-md"
			style={{ backgroundColor: "#1D0225" }}
		>
			{/* Enhanced background */}
			<div className="absolute inset-0 bg-gradient-to-t from-[#1D0225] via-[#AE16A7]/5 to-transparent"></div>

			<div className="grid grid-cols-5 h-20 relative z-10">
				{bottomNavItems.slice(0, 5).map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="flex flex-col items-center justify-center"
					>
						<Button
							variant="ghost"
							size="sm"
							className={`flex flex-col items-center space-y-1 h-full w-full rounded-none transition-all duration-300 relative border-t-2 ${
								isActive(item.href)
									? "bg-gradient-to-b from-[#AE16A7]/30 to-transparent text-white border-t-[#FF068D] scale-105 shadow-lg"
									: "text-[#AE16A7] hover:text-white hover:bg-gradient-to-b hover:from-[#AE16A7]/20 hover:to-transparent border-t-transparent"
							}`}
						>
							<item.icon
								className={`w-6 h-6 ${
									isActive(item.href) ? "text-[#FF068D]" : ""
								}`}
							/>
							<span className="text-xs font-bold">{item.label}</span>
							{item.badge && (
								<Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-[#FF068D] to-[#FA5F04] text-white text-xs font-bold animate-bounce shadow-lg border border-white">
									{item.badge}
								</Badge>
							)}
							{isActive(item.href) && (
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#FF068D] to-[#FA5F04] rounded-b-full shadow-lg" />
							)}
						</Button>
					</Link>
				))}
			</div>
		</nav>
	);
}
