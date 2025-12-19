"use client";
import Image from "next/image";
import Link from "next/link";
import {
	Users,
	Briefcase,
	Star,
	TrendingUp,
	Shield,
	Zap,
	ArrowRight,
	CheckCircle,
	Award,
	Globe,
} from "lucide-react";

export function About() {
	const stats = [
		{
			icon: Users,
			value: "50K+",
			label: "Active Freelancers",
			color: "from-purple-500 to-pink-500",
		},
		{
			icon: Briefcase,
			value: "25K+",
			label: "Projects Completed",
			color: "from-orange-500 to-red-500",
		},
		{
			icon: Star,
			value: "4.9/5",
			label: "Average Rating",
			color: "from-yellow-500 to-orange-500",
		},
		{
			icon: TrendingUp,
			value: "$10M+",
			label: "Earned by Freelancers",
			color: "from-green-500 to-blue-500",
		},
	];

	const features = [
		{
			icon: Shield,
			title: "Secure Payments",
			description: "Smart contract-based payments with escrow protection",
		},
		{
			icon: Zap,
			title: "Instant Matching",
			description: "AI-powered matching connects you with perfect talent",
		},
		{
			icon: Globe,
			title: "Global Network",
			description: "Access talent from 150+ countries worldwide",
		},
	];

	return (
		<section
			className="py-16 md:py-24 relative overflow-hidden"
			style={{ backgroundColor: "#1D0225" }}
		>
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#1D0225] via-purple-900/20 to-[#1D0225]" />
			<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent" />

			{/* Animated Decorations */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-purple-500/40 to-transparent blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-r from-orange-500/40 to-transparent blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/3 w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-r from-pink-500/40 to-transparent blur-2xl animate-pulse delay-500"></div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
					{/* Left side: Image + Floating Stats */}
					<div className="relative flex justify-center items-center order-2 lg:order-1 mt-10 sm:mt-0">
						{/* Image Container */}
						<div className="relative group">
							<div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
							<div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-purple-500/30">
								<Image
									src="/images/ai-landing.png"
									alt="FreeLanceDAO Community"
									width={400}
									height={400}
									className="rounded-xl md:rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
								/>

								{/* Floating orbs */}
								<div className="absolute -top-2 -right-2 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-lg"></div>
								<div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-10 md:h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
							</div>
						</div>

						{/* Floating Stat Cards (hidden on mobile) */}
						<div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 hidden sm:block">
							<div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-purple-300/30 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-xl transform hover:scale-110 transition-all duration-300">
								<div className="flex items-center space-x-2">
									<Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
									<div>
										<p className="text-white font-bold text-sm md:text-base">
											50K+
										</p>
										<p className="text-purple-100 text-xs">Freelancers</p>
									</div>
								</div>
							</div>
						</div>

						<div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 hidden sm:block">
							<div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-orange-300/30 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-xl transform hover:scale-110 transition-all duration-300">
								<div className="flex items-center space-x-2">
									<Award className="w-4 h-4 md:w-5 md:h-5 text-white" />
									<div>
										<p className="text-white font-bold text-sm md:text-base">
											4.9★
										</p>
										<p className="text-orange-100 text-xs">Rating</p>
									</div>
								</div>
							</div>
						</div>

						<div className="absolute top-1/2 -right-8 md:-right-12 transform -translate-y-1/2 hidden sm:block">
							<div className="bg-gradient-to-r from-green-500/90 to-blue-500/90 backdrop-blur-xl border border-green-300/30 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-xl transform hover:scale-110 transition-all duration-300">
								<div className="flex items-center space-x-2">
									<TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
									<div>
										<p className="text-white font-bold text-sm md:text-base">
											$10M+
										</p>
										<p className="text-green-100 text-xs">Earned</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right side: Content */}
					<div className="space-y-6 md:space-y-8 order-1 lg:order-2 text-center lg:text-left">
						{/* Badge */}
						<div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm">
							<Award
								className="w-4 h-4 md:w-5 md:h-5 mr-2"
								style={{ color: "#FA5F04" }}
							/>
							<span className="text-orange-300 font-semibold text-sm md:text-base">
								#1 Decentralized Freelance Platform
							</span>
						</div>

						{/* Title */}
						<h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
							Find The Best{" "}
							<span
								className="bg-gradient-to-r bg-clip-text text-transparent"
								style={{
									backgroundImage: "linear-gradient(45deg, #FA5F04, #FF068D)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								Freelancers
							</span>
							<br />
							In Minutes
						</h1>

						{/* Description */}
						<p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
							Tired of endless searching? At{" "}
							<span className="font-bold text-white">FreeLanceDAO</span>, you
							can connect with trusted talent across the globe using{" "}
							<span style={{ color: "#FA5F04" }} className="font-semibold">
								AI-powered matching
							</span>{" "}
							and{" "}
							<span style={{ color: "#AE16A7" }} className="font-semibold">
								blockchain security
							</span>
							.
						</p>

						{/* Features */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
							{features.map((feature, index) => (
								<div
									key={index}
									className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group"
								>
									<div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:scale-110 transition-transform duration-300">
										<feature.icon
											className="w-5 h-5"
											style={{ color: "#FA5F04" }}
										/>
									</div>
									<div>
										<h3 className="text-white font-semibold text-sm md:text-base">
											{feature.title}
										</h3>
										<p className="text-gray-400 text-xs md:text-sm">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-8 items-center sm:items-start">
							<button className="group relative overflow-hidden px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
								<div className="flex items-center justify-center space-x-2">
                				<Link href="/freelancers" className="flex items-center gap-3 px-4 py-2 hover:text-white">

									<span>Hire Talent Now</span>
									<ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
									</Link>
								</div>
								<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</button>

							<button className="group px-6 py-3 md:px-8 md:py-4 border-2 border-purple-500 text-purple-300 hover:text-white hover:bg-purple-500/20 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105">
								<div className="flex items-center justify-center space-x-2">
									<Users className="w-4 h-4 md:w-5 md:h-5" />
									<Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-2 hover:text-white">
									<span>I'm a Freelancer</span>
									</Link>
								</div>
							</button>
						</div>

						{/* Trust Indicators */}
						<div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-6 border-t border-purple-500/20">
							<div className="flex items-center space-x-2 text-gray-400">
								<CheckCircle className="w-5 h-5 text-green-400" />
								<span className="text-sm">Verified Profiles</span>
							</div>
							<div className="flex items-center space-x-2 text-gray-400">
								<Shield className="w-5 h-5 text-blue-400" />
								<span className="text-sm">Secure Payments</span>
							</div>
							<div className="flex items-center space-x-2 text-gray-400">
								<Globe className="w-5 h-5 text-purple-400" />
								<span className="text-sm">150+ Countries</span>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-24">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="group p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-400/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-center"
						>
							<div
								className={`inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-r ${stat.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
							>
								<stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
							</div>
							<div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
								{stat.value}
							</div>
							<div className="text-gray-400 text-xs md:text-sm">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
