"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
	Building,
	TrendingUp,
	Code,
	Zap,
	Database,
	Shield,
	Star,
	Award,
	Globe,
	Cpu,
	Network,
	Rocket,
} from "lucide-react";

interface Partner {
	name: string;
	logo: string;
	category: string;
	icon: React.ElementType;
}

export function TrustedPartnersSection() {
	const partners: Partner[] = [
		{ name: "TechCorp", logo: "TC", category: "Technology", icon: Code },
		{
			name: "BlockchainLabs",
			logo: "BL",
			category: "Blockchain",
			icon: Shield,
		},
		{
			name: "AI Innovations",
			logo: "AI",
			category: "Artificial Intelligence",
			icon: Zap,
		},
		{
			name: "WebDev Studio",
			logo: "WD",
			category: "Web Development",
			icon: Building,
		},
		{
			name: "CryptoStart",
			logo: "CS",
			category: "Cryptocurrency",
			icon: TrendingUp,
		},
		{
			name: "DataFlow",
			logo: "DF",
			category: "Data Analytics",
			icon: Database,
		},
		{
			name: "GlobalTech",
			logo: "GT",
			category: "Enterprise Solutions",
			icon: Globe,
		},
		{
			name: "DevForce",
			logo: "DF",
			category: "Development",
			icon: Rocket,
		},
		{
			name: "NetSolutions",
			logo: "NS",
			category: "Networking",
			icon: Network,
		},
		{
			name: "CloudCore",
			logo: "CC",
			category: "Cloud Computing",
			icon: Cpu,
		},
		{
			name: "StarVentures",
			logo: "SV",
			category: "Investment",
			icon: Star,
		},
		{
			name: "EliteLabs",
			logo: "EL",
			category: "Research",
			icon: Award,
		},
	];

	// Duplicate the partners array for seamless infinite scroll
	const duplicatedPartners = [...partners, ...partners];

	return (
		<section
			className="py-20 overflow-hidden relative"
			style={{
				background:
					"linear-gradient(135deg, rgba(174, 22, 167, 0.1), rgba(255, 6, 141, 0.05), rgba(250, 95, 4, 0.05))",
			}}
		>
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-purple-400/20 animate-pulse"></div>
				<div className="absolute bottom-10 right-10 w-40 h-40 rounded-full border border-pink-400/20 animate-pulse delay-700"></div>
				<div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full border border-orange-400/20 animate-pulse delay-300"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="text-center mb-16">
					<div
						className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse shadow-lg border border-pink-500/20"
						style={{
							backgroundColor: "rgba(174, 22, 167, 0.1)",
							color: "#FF068D",
						}}
					>
						<Award className="w-4 h-4 mr-2" />
						Industry Leaders
						<Star className="w-4 h-4 ml-2" style={{ color: "#FA5F04" }} />
					</div>
					<h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
						<span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
							Trusted by the
						</span>
						<br />
						<span
							className="bg-gradient-to-r bg-clip-text text-transparent animate-glow"
							style={{
								backgroundImage:
									"linear-gradient(45deg, #AE16A7, #FA5F04, #FF068D)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Best in Business
						</span>
					</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
						Join thousands of companies who trust FreeLanceDAO for their
						freelancing needs
					</p>
				</div>

				{/* Moving Marquee */}
				<div className="relative">
					{/* Gradient overlays for fade effect */}
					<div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#1D0225] to-transparent z-10"></div>
					<div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#1D0225] to-transparent z-10"></div>

					{/* Marquee container */}
					<div className="marquee-container overflow-hidden">
						<div className="marquee-content flex animate-marquee-partners">
							{duplicatedPartners.map((partner, index) => {
								const IconComponent = partner.icon;
								return (
									<div
										key={index}
										className="flex-shrink-0 mx-6 group cursor-pointer"
									>
										<Card
											className="w-72 h-40 transition-all duration-500 hover:scale-105 hover:shadow-2xl glass-effect border-2 group-hover:border-pink-500/50"
											style={{
												backgroundColor: "rgba(255, 255, 255, 0.08)",
												borderColor: "rgba(174, 22, 167, 0.3)",
											}}
										>
											<CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
												<div className="relative mb-4">
													<div
														className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
														style={{
															background:
																"linear-gradient(135deg, #AE16A7, #FF068D)",
														}}
													>
														<IconComponent className="w-8 h-8 text-white" />
													</div>
													{/* Animated glow effect */}
													<div
														className="absolute inset-0 w-16 h-16 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500 animate-pulse"
														style={{
															background:
																"linear-gradient(135deg, #FF068D, #FA5F04)",
														}}
													></div>
												</div>
												<h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-orange-400 transition-all duration-300">
													{partner.name}
												</h3>
												<p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 font-medium">
													{partner.category}
												</p>
											</CardContent>
										</Card>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Partnership Stats */}
				<div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
					<div
						className="space-y-3 p-6 rounded-2xl border border-purple-500/20"
						style={{ backgroundColor: "rgba(174, 22, 167, 0.1)" }}
					>
						<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
							500+
						</div>
						<div className="text-gray-300 font-semibold">Global Partners</div>
						<div className="text-sm text-gray-400">Across 50+ countries</div>
					</div>
					<div
						className="space-y-3 p-6 rounded-2xl border border-orange-500/20"
						style={{ backgroundColor: "rgba(250, 95, 4, 0.1)" }}
					>
						<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
							95%
						</div>
						<div className="text-gray-300 font-semibold">Success Rate</div>
						<div className="text-sm text-gray-400">Project completion</div>
					</div>
					<div
						className="space-y-3 p-6 rounded-2xl border border-pink-500/20"
						style={{ backgroundColor: "rgba(255, 6, 141, 0.1)" }}
					>
						<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
							24/7
						</div>
						<div className="text-gray-300 font-semibold">Support</div>
						<div className="text-sm text-gray-400">Round-the-clock help</div>
					</div>
					<div
						className="space-y-3 p-6 rounded-2xl border border-purple-500/20"
						style={{ backgroundColor: "rgba(174, 22, 167, 0.1)" }}
					>
						<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
							$10M+
						</div>
						<div className="text-gray-300 font-semibold">Volume</div>
						<div className="text-sm text-gray-400">Projects completed</div>
					</div>
				</div>
			</div>
		</section>
	);
}
