"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
	ChevronRight,
	Bot,
	Building2,
	Vote,
	Gavel,
	Coins,
	Newspaper,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

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

interface SidebarNavigationProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SidebarNavigation({ isOpen, onClose }: SidebarNavigationProps) {
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const pathname = usePathname();
	const { user, isAuthenticated, signOut } = useAuth();

	const isActive = (path: string) => pathname === path;

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
		{ href: "/profile", label: "Profile", icon: User },
		{ href: "/settings", label: "Settings", icon: Settings },
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
		{ href: "/profile", label: "Profile", icon: User },
		{ href: "/settings", label: "Settings", icon: Settings },
	];

	const getNavigationItems = () => {
		if (!isAuthenticated) return [];
		return user?.role === "freelancer"
			? freelancerNavigationItems
			: clientNavigationItems;
	};

	const navigationItems = getNavigationItems();

	const toggleExpanded = (href: string) => {
		setExpandedItems((prev) =>
			prev.includes(href)
				? prev.filter((item) => item !== href)
				: [...prev, href]
		);
	};

	// Close sidebar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const sidebar = document.getElementById("sidebar-navigation");
			if (sidebar && !sidebar.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen, onClose]);

	return (
		<>
			{/* Overlay */}
			{isOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
			)}

			{/* Sidebar */}
			<div
				id="sidebar-navigation"
				className={cn(
					"fixed left-0 top-0 h-full w-80 border-r border-[#AE16A7]/30 shadow-lg transform transition-transform duration-300 ease-in-out z-50",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
				style={{ backgroundColor: "#1D0225" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-[#AE16A7]/30">
					<div className="flex items-center space-x-3">
						<Avatar className="w-10 h-10">
							<AvatarFallback className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] text-white font-semibold">
								{user?.name
									?.split(" ")
									.map((n) => n[0])
									.join("") || "U"}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium text-white">{user?.name}</div>
							<div className="flex items-center space-x-1 text-xs text-[#AE16A7]/70">
								{user?.isVerified && (
									<CheckCircle className="w-3 h-3 text-[#FA5F04]" />
								)}
								<span className="capitalize">
									{user?.role} {user?.isVerified ? "• Verified" : "• Unverified"}
								</span>
							</div>
						</div>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-[#AE16A7]/20">
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Navigation Items */}
				<div className="flex-1 overflow-y-auto p-4 space-y-2">
					{navigationItems.map((item) => (
						<div key={item.href}>
							{item.subItems ? (
								<>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start transition-all duration-200",
										isActive(item.href)
											? "bg-gradient-to-r from-[#AE16A7]/25 to-[#FF068D]/25 text-white border-l-4 border-[#AE16A7] shadow-md shadow-[#AE16A7]/10"
											: "text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/10 hover:to-[#FF068D]/10"
									)}
									onClick={() => toggleExpanded(item.href)}
								>
									<item.icon className={cn("w-5 h-5 mr-3", isActive(item.href) ? "text-[#FA5F04]" : "")} />
									<span className="flex-1 text-left">{item.label}</span>
									<ChevronRight
										className={cn(
											"w-4 h-4 transition-transform",
											expandedItems.includes(item.href) ? "rotate-90" : ""
										)}
									/>
									</Button>
									{expandedItems.includes(item.href) && (
										<div className="ml-8 mt-2 space-y-1">
											{item.subItems.map((sub) => (
												<Link key={sub.href} href={sub.href} onClick={onClose}>
												<Button
													variant="ghost"
													size="sm"
													className={cn(
														"w-full justify-start transition-all duration-200",
														isActive(sub.href)
															? "bg-gradient-to-r from-[#AE16A7]/25 to-[#FF068D]/25 text-white border-l-4 border-[#FF068D] shadow-md shadow-[#FF068D]/10"
															: "text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/10 hover:to-[#FF068D]/10"
													)}
												>
													<sub.icon className={cn("w-4 h-4 mr-3", isActive(sub.href) ? "text-[#FA5F04]" : "")} />
													{sub.name}
												</Button>
												</Link>
											))}
										</div>
									)}
								</>
							) : (
							<Link href={item.href} onClick={onClose}>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start transition-all duration-200",
										isActive(item.href)
											? "bg-gradient-to-r from-[#AE16A7]/25 to-[#FF068D]/25 text-white border-l-4 border-[#AE16A7] shadow-md shadow-[#AE16A7]/10"
											: "text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/10 hover:to-[#FF068D]/10"
									)}
								>
									<item.icon className={cn("w-5 h-5 mr-3", isActive(item.href) ? "text-[#FA5F04]" : "")} />
									<span className="flex-1 text-left">{item.label}</span>
									{item.badge && (
										<Badge className="bg-gradient-to-r from-[#FF068D] to-[#FA5F04] text-white text-xs px-1.5 py-0.5">
											{item.badge}
										</Badge>
									)}
								</Button>
							</Link>
							)}
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="border-t border-[#AE16A7]/30 p-4">
					<Button
						variant="ghost"
						className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
						onClick={() => {
							signOut();
							onClose();
						}}
					>
						<LogOut className="w-5 h-5 mr-3" />
						Sign Out
					</Button>
				</div>
			</div>
		</>
	);
}