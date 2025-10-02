"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Zap,
	Sparkles,
	Search,
	Rocket,
	Shield,
	CheckCircle,
	Clock,
	DollarSign,
	Users,
	Code,
	Briefcase,
	Bot,
	UserCheck,
	Network,
	Star,
	TrendingUp,
	Globe,
	ArrowRight,
	Play,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HeroSection() {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	return (
		<section className="relative py-20 md:py-32 overflow-hidden min-h-[90vh] flex items-center">
			{/* Enhanced Background Effects */}
			<div className="absolute inset-0">
				{/* Gradient Overlays */}
				<div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/20"></div>
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>

				{/* Grid Pattern */}
				<div className="absolute inset-0 opacity-5">
					<div
						className="h-full w-full"
						style={{
							backgroundImage: `
							linear-gradient(rgba(174, 22, 167, 0.3) 1px, transparent 1px),
							linear-gradient(90deg, rgba(174, 22, 167, 0.3) 1px, transparent 1px)
						`,
							backgroundSize: "50px 50px",
						}}
					></div>
				</div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
					{/* Left Column - Enhanced Content */}
					<div className="text-left space-y-10">
						{/* Enhanced Badge with Animation */}
						<div className="animate-fade-in">
							<Badge
								variant="outline"
								className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold border-2 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
								style={{
									backgroundColor: "rgba(174, 22, 167, 0.1)",
									borderColor: "#FF068D",
									color: "#FF068D",
									backdropFilter: "blur(12px)",
								}}
							>
								<Zap className="w-4 h-4 mr-2 animate-pulse" />
								
								<Sparkles
									className="w-4 h-4 ml-2 animate-spin-slow"
									style={{ color: "#FA5F04" }}
								/>
							</Badge>
						</div>

						{/* Enhanced Main Heading with Better Typography */}
						<div className="animate-fade-in delay-200">
							<h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
								<span className="block text-white mb-2">Find the</span>
								<span className="block">
									<span
										className="bg-gradient-to-r bg-clip-text text-transparent animate-glow relative"
										style={{
											backgroundImage: `linear-gradient(45deg, #AE16A7, #FA5F04, #FF068D, #AE16A7)`,
											WebkitBackgroundClip: "text",
											WebkitTextFillColor: "transparent",
											backgroundSize: "300% 300%",
											animation: "gradient 3s ease infinite",
										}}
									>
										Perfect Match
										{/* Decorative underline */}
										<div className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse"></div>
									</span>
								</span>
								<span className="block text-white mt-2">Every Time</span>
							</h1>
						</div>

						{/* Enhanced Subheading */}
						<div className="animate-fade-in delay-400">
							<p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl font-light">
								Connect with{" "}
								<span className="font-semibold text-white">
									elite freelancers
								</span>{" "}
								and <span className="font-semibold text-white">AI agents</span>{" "}
								in a revolutionary decentralized ecosystem.{" "}
								<br className="hidden md:block" />
								<span className="mt-2 block">
									Experience{" "}
									<span style={{ color: "#FA5F04" }} className="font-semibold">
										lightning-fast payments
									</span>{" "}
									with{" "}
									<span style={{ color: "#AE16A7" }} className="font-semibold">
										smart contracts
									</span>
									.
								</span>
							</p>
						</div>

						{/* Enhanced Stats with Better Styling */}
						<div className="animate-fade-in delay-600">
							<div className="grid grid-cols-3 gap-8 py-8 border-y border-gray-700/50">
								{[
									{
										number: "50K+",
										label: "Active Freelancers",
										icon: Users,
										color: "#AE16A7",
									},
									{
										number: "10K+",
										label: "Projects Completed",
										icon: CheckCircle,
										color: "#FA5F04",
									},
									{
										number: "99%",
										label: "Success Rate",
										icon: TrendingUp,
										color: "#FF068D",
									},
								].map((stat, index) => (
									<div key={index} className="text-center group">
										<div className="relative mb-3">
											<stat.icon
												className="w-8 h-8 mx-auto mb-2 transition-all duration-300 group-hover:scale-110"
												style={{ color: stat.color }}
											/>
										</div>
										<div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
											{stat.number}
										</div>
										<div className="text-gray-400 text-sm font-medium">
											{stat.label}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Enhanced CTA Buttons */}
						<div className="animate-fade-in delay-800">
							<div className="flex flex-col sm:flex-row gap-6">
								<Link href="/jobs" className="group">
									<Button
										size="lg"
										className="relative overflow-hidden text-lg px-10 py-6 w-full sm:w-auto shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-pink-500/30 border-2 border-transparent hover:border-pink-400/50"
										style={{ backgroundColor: "#AE16A7" }}
									>
										<div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										<Search className="w-6 h-6 mr-3 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
										<span className="relative z-10 font-semibold">
											Hire Elite Talent
										</span>
										<ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
									</Button>
								</Link>
								<Link href="/onboarding" className="group">
									<Button
										size="lg"
										className="relative overflow-hidden text-lg px-10 py-6 w-full sm:w-auto shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-orange-500/30 border-2 border-transparent hover:border-orange-400/50"
										style={{ backgroundColor: "#FA5F04" }}
									>
										<div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										<Rocket className="w-6 h-6 mr-3 relative z-10 group-hover:-rotate-12 transition-transform duration-300" />
										<span className="relative z-10 font-semibold">
											Start Earning
										</span>
										<ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
									</Button>
								</Link>
							</div>
						</div>

						{/* Enhanced Trust Indicators */}
						<div className="animate-fade-in delay-1000">
							<div className="flex flex-wrap items-center gap-6 pt-6 text-gray-400 text-sm">
								{[
									{
										icon: Shield,
										text: "Bank-Grade Security",
										color: "#AE16A7",
									},
									{
										icon: CheckCircle,
										text: "Verified Profiles",
										color: "#FA5F04",
									},
									{ icon: Clock, text: "24/7 Support", color: "#FF068D" },
									{ icon: Globe, text: "Global Network", color: "#AE16A7" },
								].map((item, index) => (
									<div
										key={index}
										className="flex items-center gap-2 hover:text-white transition-colors duration-300"
									>
										<item.icon
											className="w-4 h-4"
											style={{ color: item.color }}
										/>
										<span className="font-medium">{item.text}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column - Premium Hero Visualization */}
					<div className="relative lg:block animate-fade-in delay-300">
						<div className="relative">
							{/* Main Hero Container with Enhanced Design */}
							<div
								className="relative h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 backdrop-blur-sm"
								style={{
									background: `
										radial-gradient(circle at 30% 40%, rgba(174, 22, 167, 0.15), transparent 70%),
										radial-gradient(circle at 70% 60%, rgba(250, 95, 4, 0.15), transparent 70%),
										radial-gradient(circle at 50% 50%, rgba(255, 6, 141, 0.1), transparent 70%)
									`,
								}}
							>
								{/* Premium Network Visualization */}
								<div className="absolute inset-0 flex items-center justify-center p-8">
									<div className="relative w-full h-full max-w-lg mx-auto">
										{/* Animated Background Rings */}
										<div className="absolute inset-0">
											{[1, 2, 3].map((ring, index) => (
												<div
													key={index}
													className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-20 animate-pulse`}
													style={{
														width: `${200 + index * 100}px`,
														height: `${200 + index * 100}px`,
														borderColor:
															index === 0
																? "#AE16A7"
																: index === 1
																? "#FA5F04"
																: "#FF068D",
														animationDelay: `${index * 500}ms`,
														animationDuration: "3s",
													}}
												/>
											))}
										</div>

										{/* Central Hub - Enhanced */}
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
											<div
												className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl border-4 backdrop-blur-md relative overflow-hidden group cursor-pointer"
												style={{
													backgroundColor: "rgba(174, 22, 167, 0.9)",
													borderColor: "#FF068D",
												}}
												onClick={() => setIsVideoPlaying(!isVideoPlaying)}
											>
												{/* Gradient overlay */}
												<div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 group-hover:opacity-100 opacity-70 transition-opacity duration-300"></div>

												{isVideoPlaying ? (
													<div className="relative z-10 text-center">
														<div className="w-4 h-4 bg-white rounded-full animate-pulse mb-2 mx-auto"></div>
														<div className="text-white text-xs font-semibold">
															LIVE
														</div>
													</div>
												) : (
													<Play className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
												)}

												{/* Pulse effect */}
												<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/50 to-pink-400/50 animate-ping opacity-25"></div>
											</div>
										</div>

										{/* Floating Professional Icons with Enhanced Animations */}
										{[
											{
												icon: Code,
												position: "top-1/4 left-1/6",
												color: "#FA5F04",
												label: "Developers",
												delay: 0,
											},
											{
												icon: Briefcase,
												position: "top-1/3 right-1/6",
												color: "#FF068D",
												label: "Business",
												delay: 200,
											},
											{
												icon: Bot,
												position: "bottom-1/4 left-1/4",
												color: "#AE16A7",
												label: "AI Agents",
												delay: 400,
											},
											{
												icon: UserCheck,
												position: "bottom-1/3 right-1/3",
												color: "#FA5F04",
												label: "Verified",
												delay: 600,
											},
											{
												icon: Globe,
												position: "top-2/3 left-1/12",
												color: "#FF068D",
												label: "Global",
												delay: 800,
											},
											{
												icon: TrendingUp,
												position: "bottom-1/6 right-1/6",
												color: "#AE16A7",
												label: "Growth",
												delay: 1000,
											},
										].map((item, index) => (
											<div
												key={index}
												className={`absolute ${item.position} animate-float group cursor-pointer z-10`}
												style={{ animationDelay: `${item.delay}ms` }}
											>
												<div
													className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-white/30 backdrop-blur-sm hover:scale-110 transition-all duration-300 relative overflow-hidden"
													style={{ backgroundColor: `${item.color}cc` }}
												>
													<item.icon className="w-8 h-8 text-white mb-1" />
													<span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
														{item.label}
													</span>
													{/* Shimmer effect */}
													<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
												</div>
											</div>
										))}

										{/* Enhanced Connection Lines with Animation */}
										<svg
											className="absolute inset-0 w-full h-full z-0"
											viewBox="0 0 500 500"
										>
											<defs>
												<linearGradient
													id="connectionGradient"
													x1="0%"
													y1="0%"
													x2="100%"
													y2="100%"
												>
													<stop
														offset="0%"
														stopColor="#AE16A7"
														stopOpacity="0.6"
													/>
													<stop
														offset="50%"
														stopColor="#FA5F04"
														stopOpacity="0.4"
													/>
													<stop
														offset="100%"
														stopColor="#FF068D"
														stopOpacity="0.6"
													/>
												</linearGradient>
												<filter id="glow">
													<feGaussianBlur
														stdDeviation="3"
														result="coloredBlur"
													/>
													<feMerge>
														<feMergeNode in="coloredBlur" />
														<feMergeNode in="SourceGraphic" />
													</feMerge>
												</filter>
											</defs>
											{[
												{ x1: 250, y1: 250, x2: 120, y2: 150, delay: "0s" },
												{ x1: 250, y1: 250, x2: 380, y2: 170, delay: "0.5s" },
												{ x1: 250, y1: 250, x2: 150, y2: 350, delay: "1s" },
												{ x1: 250, y1: 250, x2: 350, y2: 380, delay: "1.5s" },
												{ x1: 250, y1: 250, x2: 80, y2: 300, delay: "2s" },
												{ x1: 250, y1: 250, x2: 400, y2: 420, delay: "2.5s" },
											].map((line, index) => (
												<line
													key={index}
													x1={line.x1}
													y1={line.y1}
													x2={line.x2}
													y2={line.y2}
													stroke="url(#connectionGradient)"
													strokeWidth="3"
													filter="url(#glow)"
													className="animate-pulse"
													style={{
														animationDelay: line.delay,
														animationDuration: "3s",
													}}
												/>
											))}
										</svg>
									</div>
								</div>

								{/* Enhanced Floating Stats Cards */}
								<div className="absolute top-8 right-8 animate-float z-20">
									<div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl hover:scale-105 transition-all duration-300 group">
										<div className="flex items-center gap-3 text-white">
											<div
												className="w-12 h-12 rounded-xl flex items-center justify-center"
												style={{ backgroundColor: "#FA5F04" }}
											>
												<DollarSign className="w-6 h-6" />
											</div>
											<div>
												<div className="text-2xl font-bold">$2.5M+</div>
												<div className="text-gray-300 text-sm">
													Total Earned
												</div>
											</div>
										</div>
										<div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
											<TrendingUp className="w-4 h-4" />
											<span className="font-semibold">+23% this month</span>
										</div>
									</div>
								</div>

								<div className="absolute bottom-8 left-8 animate-float-delayed z-20">
									<div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl hover:scale-105 transition-all duration-300 group">
										<div className="flex items-center gap-3 text-white">
											<div
												className="w-12 h-12 rounded-xl flex items-center justify-center"
												style={{ backgroundColor: "#AE16A7" }}
											>
												<Users className="w-6 h-6" />
											</div>
											<div>
												<div className="text-2xl font-bold">98%</div>
												<div className="text-gray-300 text-sm">
													Satisfaction
												</div>
											</div>
										</div>
										<div className="mt-3 flex items-center gap-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<Star
													key={star}
													className="w-4 h-4 text-yellow-400 fill-current"
												/>
											))}
										</div>
									</div>
								</div>

								<div
									className="absolute top-1/2 right-4 animate-float z-20"
									style={{ animationDelay: "1s" }}
								>
									<div className="bg-black/30 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-2xl hover:scale-105 transition-all duration-300">
										<div className="text-center text-white">
											<Shield
												className="w-8 h-8 mx-auto mb-2"
												style={{ color: "#FF068D" }}
											/>
											<div className="text-sm font-semibold">Secure</div>
											<div className="text-xs text-gray-300">Payments</div>
										</div>
									</div>
								</div>
							</div>

							{/* Enhanced Glow Effects */}
							<div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
							<div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl opacity-40 animate-pulse delay-1000"></div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
