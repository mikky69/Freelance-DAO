"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	User,
	Search,
	Shield,
	CheckCircle,
	Sparkles,
	ArrowRight,
	TrendingUp,
	Users,
	Bot,
	Zap,
	Star,
	Globe,
	Clock,
	Award,
	Lightbulb,
	Target,
} from "lucide-react";
import Link from "next/link";

export function FeaturesSection() {
	const steps = [
		{
			step: "01",
			title: "Create Your Profile",
			description:
				"Join with email or Web3 wallet. Build your professional presence with portfolio showcase and skill verification.",
			icon: User,
			color: "#AE16A7",
			gradient: "from-purple-500 to-pink-500",
		},
		{
			step: "02",
			title: "Discover Opportunities",
			description:
				"AI-powered matching connects you with perfect projects. Browse curated jobs or showcase your expertise.",
			icon: Search,
			color: "#FA5F04",
			gradient: "from-orange-500 to-red-500",
		},
		{
			step: "03",
			title: "Secure Smart Contracts",
			description:
				"Hedera-powered escrow ensures payment security. Milestone-based releases protect both parties.",
			icon: Shield,
			color: "#FF068D",
			gradient: "from-pink-500 to-purple-500",
		},
		{
			step: "04",
			title: "Earn & Build Reputation",
			description:
				"Complete work, earn tokens, and build on-chain reputation that follows you everywhere.",
			icon: CheckCircle,
			color: "#AE16A7",
			gradient: "from-green-500 to-blue-500",
		},
	];

	const features = [
		{
			icon: Users,
			title: "Hybrid Workforce",
			description:
				"Seamlessly blend human creativity with AI efficiency. Create powerful teams that deliver exceptional results.",
			color: "#FA5F04",
			stats: "50K+ Active",
			highlight: "Most Popular",
		},
		{
			icon: Shield,
			title: "Enterprise Security",
			description:
				"Bank-grade security with Hedera Hashgraph. Smart contracts ensure transparent, immutable transactions.",
			color: "#AE16A7",
			stats: "99.9% Uptime",
			highlight: "Secure",
		},
		{
			icon: Bot,
			title: "AI Agent Economy",
			description:
				"Deploy, monetize, and manage AI agents. Create passive income streams from your automated services.",
			color: "#FF068D",
			stats: "1000+ Agents",
			highlight: "Innovative",
		},
		{
			icon: TrendingUp,
			title: "DAO Governance",
			description:
				"Community-owned platform where your voice matters. Participate in decisions that shape the future.",
			color: "#FA5F04",
			stats: "Democratic",
			highlight: "Community Led",
		},
		{
			icon: Globe,
			title: "Global Network",
			description:
				"Connect with talent and clients worldwide. 24/7 marketplace that never sleeps.",
			color: "#AE16A7",
			stats: "50+ Countries",
			highlight: "Worldwide",
		},
		{
			icon: Lightbulb,
			title: "Innovation Hub",
			description:
				"Access cutting-edge tools and resources. Stay ahead with the latest in Web3 technology.",
			color: "#FF068D",
			stats: "Latest Tech",
			highlight: "Future Ready",
		},
	];

	return (
		<section
			className="py-24 relative overflow-hidden"
			style={{
				background:
					"linear-gradient(135deg, rgba(29, 2, 37, 0.95), rgba(174, 22, 167, 0.1), rgba(250, 95, 4, 0.05))",
			}}
		>
			{/* Background Effects */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/20 to-transparent blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-orange-500/20 to-transparent blur-3xl animate-pulse delay-700"></div>
				<div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/20 to-transparent blur-3xl animate-pulse delay-300"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* How It Works Section */}
				<div className="mb-32">
					<div className="text-center mb-20">
						<div
							className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 animate-pulse shadow-lg border border-pink-500/20"
							style={{
								backgroundColor: "rgba(174, 22, 167, 0.1)",
								color: "#FF068D",
							}}
						>
							<Target className="w-4 h-4 mr-2" />
							Simple Process
							<Sparkles className="w-4 h-4 ml-2" style={{ color: "#FA5F04" }} />
						</div>

						<h2 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
							<span className="text-white">How FreeLanceDAO</span>
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
								Actually Works
							</span>
						</h2>

						<p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
							Join the future of work with our revolutionary platform that
							combines
							<span className="text-purple-400 font-semibold">
								{" "}
								blockchain security
							</span>
							,
							<span className="text-orange-400 font-semibold">
								{" "}
								AI intelligence
							</span>
							, and
							<span className="text-pink-400 font-semibold">
								{" "}
								community governance
							</span>
						</p>
					</div>

					<div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
						{steps.map((step, index) => {
							const IconComponent = step.icon;
							return (
								<div key={index} className="relative group">
									{/* Connection Line */}
									{index < steps.length - 1 && (
										<div className="hidden lg:block absolute top-12 left-full w-full h-0.5 z-0">
											<div className="h-full bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-orange-500/50 animate-pulse"></div>
										</div>
									)}

									<div
										className="relative z-10 text-center p-8 rounded-3xl border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-purple-500/30"
										style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
									>
										{/* Step Badge */}
										<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
											<div
												className="px-4 py-2 rounded-full text-white font-bold text-sm shadow-xl border-2"
												style={{
													background: `linear-gradient(135deg, ${step.color}, ${step.color}aa)`,
													borderColor: "rgba(255, 255, 255, 0.2)",
												}}
											>
												Step {step.step}
											</div>
										</div>

										{/* Icon */}
										<div className="relative mb-8 mt-6">
											<div
												className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border-2 border-white/20"
												style={{
													background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
												}}
											>
												<IconComponent className="w-12 h-12 text-white" />
											</div>
											{/* Glow Effect */}
											<div
												className="absolute inset-0 w-24 h-24 rounded-2xl mx-auto blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500"
												style={{ backgroundColor: step.color }}
											></div>
										</div>

										<h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
											{step.title}
										</h3>

										<p className="text-gray-300 leading-relaxed text-lg group-hover:text-gray-200 transition-colors duration-300">
											{step.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Key Features Section */}
				<div>
					<div className="text-center mb-20">
						<div
							className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 animate-pulse shadow-lg border border-orange-500/20"
							style={{
								backgroundColor: "rgba(250, 95, 4, 0.1)",
								color: "#FA5F04",
							}}
						>
							<Award className="w-4 h-4 mr-2" />
							Premium Features
							<Star className="w-4 h-4 ml-2" style={{ color: "#FF068D" }} />
						</div>

						<h2 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
							<span className="text-white">Powerful Features for</span>
							<br />
							<span
								className="bg-gradient-to-r bg-clip-text text-transparent animate-glow"
								style={{
									backgroundImage:
										"linear-gradient(45deg, #FA5F04, #FF068D, #AE16A7)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								Modern Freelancing
							</span>
						</h2>

						<p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
							Everything you need to succeed in the decentralized economy. Built
							for professionals who demand excellence.
						</p>

						<Link href="/onboarding">
							<Button
								size="lg"
								className="text-lg px-8 py-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
								style={{ backgroundColor: "#AE16A7", color: "white" }}
							>
								<Sparkles className="w-5 h-5 mr-2" />
								Start Your Journey
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</div>

					<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
						{features.map((feature, index) => {
							const IconComponent = feature.icon;
							return (
								<Card
									key={index}
									className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2"
									style={{
										background:
											"linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
										borderColor: "rgba(174, 22, 167, 0.3)",
									}}
								>
									{/* Highlight Badge */}
									<div className="absolute top-4 right-4">
										<div
											className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
											style={{ backgroundColor: feature.color }}
										>
											{feature.highlight}
										</div>
									</div>

									<CardContent className="p-8 h-full flex flex-col relative z-10">
										{/* Icon Section */}
										<div className="relative mb-8">
											<div
												className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 border-2 border-white/20"
												style={{
													background: `linear-gradient(135deg, ${feature.color}, ${feature.color}cc)`,
												}}
											>
												<IconComponent className="w-10 h-10 text-white" />
											</div>
											{/* Animated Glow */}
											<div
												className="absolute inset-0 w-20 h-20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500 animate-pulse"
												style={{ backgroundColor: feature.color }}
											></div>
										</div>

										{/* Content */}
										<div className="flex-grow">
											<h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-orange-400 transition-all duration-300">
												{feature.title}
											</h3>

											<p className="text-gray-300 leading-relaxed text-lg group-hover:text-gray-200 transition-colors duration-300 mb-6">
												{feature.description}
											</p>
										</div>

										{/* Stats */}
										<div className="flex items-center justify-between pt-4 border-t border-white/10">
											<div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
												{feature.stats}
											</div>
											<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
										</div>
									</CardContent>

									{/* Hover Effect Background */}
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
										style={{
											background: `linear-gradient(135deg, ${feature.color}33, transparent)`,
										}}
									></div>
								</Card>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
