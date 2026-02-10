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
import { SidebarNavigation } from "./sidebar-navigation";
import { walletManager } from "@/lib/hedera-wallet";
import { PrivyHederaConnectButton } from "./PrivyHederaConnectButton";
import { useWallets } from "@privy-io/react-auth";
import { RoleSelectionModal } from "@/components/auth/role-selection-modal";
import { IconifyIcon } from "@/components/iconify-icon";
import { toast } from "sonner";

/** Format wallet address for display: 0x1234...5678 (6 chars start, 4 end) */
function formatWalletAddress(addr: string): string {
	if (!addr) return "";
	// Hedera native (0.0.xxxx)
	if (addr.startsWith("0.0.")) {
		return addr.length > 14 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
	}
	// EVM (0x...): always 6 chars at start (0x + 4 hex), 4 at end
	if (addr.startsWith("0x")) {
		return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
	}
	return addr.length > 14 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

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
	const [showRoleSelection, setShowRoleSelection] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [walletBalance, setWalletBalance] = useState<string | null>(null);
	const [isBalanceLoading, setIsBalanceLoading] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [addressCopied, setAddressCopied] = useState(false);
	const pathname = usePathname();
	const { user, isAuthenticated, signOut, openPrivyLogin, setUserRole } = useAuth();
	const { wallets } = useWallets();

	// Wallet address: from Privy first, then auth user
	const address = wallets.length > 0 ? wallets[0].address : user?.walletAddress;
	const isConnected = !!address;

	const copyAddressToClipboard = async () => {
		if (!address) return;
		await navigator.clipboard.writeText(address);
		setAddressCopied(true);
		toast.success("Address copied to clipboard");
		setTimeout(() => setAddressCopied(false), 2000);
	};

	const getHederaBalance = async () => {
		const bal = await walletManager.refreshBalance();
		return bal;
	};

	const isActive = (path: string) => pathname === path;
	
	// Handle role selection and login
	const handleRoleSelect = (role: "freelancer" | "client") => {
		setUserRole(role);
		setShowRoleSelection(false);
		openPrivyLogin();
	};

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
				className="sticky top-0 z-50 backdrop-blur-md shadow-2xl relative border-b border-[#AE16A7]/20"
				style={{ backgroundColor: "#1D0225" }}
			>
				<div className="w-full sm:px-4 lg:px-8 relative z-10">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Enhanced Logo */}
						<Link
							href="/"
							className="flex items-center space-x-2 md:space-x-3 group relative flex-shrink-0"
						>
							<div className="relative">
								<div className="absolute -inset-2 bg-gradient-to-r from-[#AE16A7] via-[#FF068D] to-[#FA5F04] rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
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
												className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:shadow-lg hover:shadow-[#AE16A7]/20 border border-transparent hover:border-[#AE16A7]/30 rounded-xl ${isActive(item.href)
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
													className={`w-4 h-4 transition-transform duration-300 ${openDropdown === item.href ? "rotate-180" : ""
														}`}
												/>
												{isActive(item.href) && (
													<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#FF068D] rounded-full animate-pulse shadow-lg shadow-[#FF068D]/50" />
												)}
											</Button>
											{openDropdown === item.href && (
												<div
													className={`absolute mt-3 w-56 border border-[#AE16A7]/30 rounded-xl shadow-2xl z-[9999] backdrop-blur-md overflow-hidden ${index >= navigationItems.length - 2 ? 'right-0' : 'left-0'
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
												className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:shadow-lg hover:shadow-[#AE16A7]/20 border border-transparent hover:border-[#AE16A7]/30 rounded-xl ${isActive(item.href)
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
							{/* <div className="hidden sm:block">
								<div className="relative">
									<PrivyHederaConnectButton />
								</div>
							</div> */}

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
														className={`w-2 h-2 rounded-full ${user?.isVerified ? "bg-[#FA5F04]" : "bg-gray-400"
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
											<Avatar className="w-10 h-10 flex-shrink-0">
												<AvatarFallback className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] text-white font-semibold">
													{user?.name
														?.split(" ")
														.map((n) => n[0])
														.join("") || "U"}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-medium text-white truncate">{user?.name}</span>
													{user?.role && (
														<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#AE16A7]/20 text-[#FF068D] capitalize border border-[#AE16A7]/30 flex-shrink-0">
															{user.role}
														</span>
													)}
												</div>
												{user?.email && (
													<div className="text-xs text-[#AE16A7]/70 truncate">{user.email}</div>
												)}
												{address && (
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															copyAddressToClipboard();
														}}
														className="mt-1.5 flex items-center gap-2 w-full text-left rounded-md py-1 pr-2 -ml-1 hover:bg-white/5 transition-colors cursor-pointer group"
														title={`Copy: ${address}`}
													>
														<span className="font-mono text-xs text-white/90 group-hover:text-[#FA5F04]">
															{formatWalletAddress(address)}
														</span>
														{addressCopied ? (
															<IconifyIcon icon="mdi:check" className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden />
														) : (
															<IconifyIcon icon="mdi:content-copy" className="w-3.5 h-3.5 text-white/50 group-hover:text-[#FA5F04] flex-shrink-0" aria-hidden />
														)}
													</button>
												)}
												{((user?.profile?.rating ?? 0) > 0 || (user?.role === "freelancer" && (user?.profile?.completedJobs ?? 0) > 0) || (user?.role !== "freelancer" && (user?.profile?.projectsPosted ?? 0) > 0)) && (
													<div className="flex items-center gap-4 text-xs text-white/60 mt-1">
														{(user?.profile?.rating ?? 0) > 0 && (
															<span className="flex items-center gap-1">
																<TrendingUp className="w-3 h-3 text-green-500" />
																{user?.profile?.rating} Rating
															</span>
														)}
														{user?.role === "freelancer" && (user?.profile?.completedJobs ?? 0) > 0 && (
															<span className="flex items-center gap-1">
																<Award className="w-3 h-3 text-[#FA5F04]" />
																{user?.profile?.completedJobs} Jobs
															</span>
														)}
														{user?.role !== "freelancer" && (user?.profile?.projectsPosted ?? 0) > 0 && (
															<span className="flex items-center gap-1">
																<Award className="w-3 h-3 text-[#FA5F04]" />
																{user?.profile?.projectsPosted} Projects
															</span>
														)}
													</div>
												)}
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
								<div className="flex items-center space-x-2">
									<Button 
										variant="ghost"
										onClick={() => openPrivyLogin()}
										className="text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/10 hover:to-[#FF068D]/10 hover:text-[#FF068D] transition-all duration-300 flex items-center space-x-1 md:space-x-2"
									>
										<IconifyIcon icon="mdi:login" className="w-4 h-4" />
										<span className="font-semibold text-sm">Log In</span>
									</Button>
									<Button 
										onClick={() => setShowRoleSelection(true)}
										className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] hover:from-[#AE16A7]/80 hover:to-[#FF068D]/80 flex items-center space-x-1 md:space-x-2 shadow-lg shadow-[#AE16A7]/30 rounded-xl border border-[#AE16A7]/50 transition-all duration-300 hover:scale-105 px-3 md:px-4 py-2"
									>
										<IconifyIcon icon="mdi:account-plus" className="w-4 h-4" />
										<span className="font-semibold text-sm">
											Sign Up
										</span>
									</Button>
								</div>
							)}

							{/* Role Selection Modal */}
							<RoleSelectionModal 
								isOpen={showRoleSelection}
								onClose={() => setShowRoleSelection(false)}
								onSelectRole={handleRoleSelect}
								onLoginClick={() => {
									setShowRoleSelection(false);
									openPrivyLogin();
								}}
							/>

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
										className={`w-full justify-start transition-all duration-300 py-4 rounded-xl border ${isActive(item.href)
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
									<Sparkles className="w-5 h-5 mr-2" />
									Get Started
								</div>
								<Button
									variant="ghost"
									onClick={() => {
										setIsMobileMenuOpen(false);
										openPrivyLogin();
									}}
									className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
								>
									<IconifyIcon icon="mdi:login" className="w-4 h-4 mr-3 text-[#FA5F04]" />
									Log In
								</Button>
								<Button
									variant="ghost"
									onClick={() => {
										setIsMobileMenuOpen(false);
										setShowRoleSelection(true);
									}}
									className="w-full justify-start text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 border border-[#AE16A7]/30 rounded-xl py-3"
								>
									<IconifyIcon icon="mdi:account-plus" className="w-4 h-4 mr-3 text-[#FA5F04]" />
									Sign Up
								</Button>
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
							className={`flex flex-col items-center space-y-1 h-full w-full rounded-none transition-all duration-300 relative border-t-2 ${isActive(item.href)
									? "bg-gradient-to-b from-[#AE16A7]/30 to-transparent text-white border-t-[#FF068D] scale-105 shadow-lg"
									: "text-[#AE16A7] hover:text-white hover:bg-gradient-to-b hover:from-[#AE16A7]/20 hover:to-transparent border-t-transparent"
								}`}
						>
							<item.icon
								className={`w-6 h-6 ${isActive(item.href) ? "text-[#FF068D]" : ""
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
