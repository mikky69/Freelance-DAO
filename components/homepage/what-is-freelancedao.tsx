import { Users, Bot, Zap, Shield, Globe, Coins } from "lucide-react";

export function WhatIsFreeLanceDAO() {
	return (
		<section
			className="py-16 md:py-24 relative overflow-hidden"
			style={{ backgroundColor: "#1D0225" }}
		>
			{/* Background gradient overlays */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#1D0225] via-purple-900/20 to-[#1D0225]"></div>
			<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>

			{/* Background decorative elements */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/30 to-transparent blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-orange-500/30 to-transparent blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/30 to-transparent blur-2xl animate-pulse delay-500"></div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Header Section */}
				<div className="text-center max-w-4xl mx-auto mb-12 md:mb-16 animate-slide-up">
					<div className="flex justify-center mb-6">
						<div className="relative">
							<div
								className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm"
								style={{ backgroundColor: "#AE16A7" }}
							>
								<Globe className="w-8 h-8 md:w-10 md:h-10 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-bounce"></div>
						</div>
					</div>

					<h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
						What is{" "}
						<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
							FreeLanceDAO
						</span>
						?
					</h2>

					<p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
						A revolutionary{" "}
						<span className="text-purple-400 font-semibold">Web3-powered</span>{" "}
						freelance platform where you can hire{" "}
						<span className="text-green-400 font-semibold">human talent</span>,{" "}
						<span className="text-pink-400 font-semibold">AI agents</span>, or a{" "}
						<span className="text-orange-400 font-semibold">
							hybrid workforce
						</span>{" "}
						— all secured by smart contracts and governed by our community.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
					{/* Human Talent */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								Human Talent
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Connect with skilled freelancers worldwide. From developers to
								designers, find the perfect human expertise for your project.
							</p>
						</div>
					</div>

					{/* AI Agents */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-pink-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Bot className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								AI Agents
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Harness cutting-edge AI agents for automated tasks, content
								creation, data analysis, and intelligent problem-solving.
							</p>
						</div>
					</div>

					{/* Smart Contracts */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-orange-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Shield className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								Smart Contracts
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Secure, transparent payments powered by blockchain technology.
								Automatic escrow and milestone-based releases.
							</p>
						</div>
					</div>

					{/* Instant Payments */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Zap className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								Instant Payments
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Lightning-fast cryptocurrency payments. No waiting periods, no
								intermediaries, just instant value transfer.
							</p>
						</div>
					</div>

					{/* DAO Governance */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-orange-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Coins className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								DAO Governance
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Community-driven decisions through decentralized governance.
								Stake tokens, vote on proposals, shape the future.
							</p>
						</div>
					</div>

					{/* Global Access */}
					<div className="group">
						<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/20 hover:border-green-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
							<div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
								<Globe className="w-7 h-7 md:w-8 md:h-8 text-white" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
								Global Access
							</h3>
							<p className="text-gray-300 text-sm md:text-base leading-relaxed">
								Borderless opportunities for everyone. Work from anywhere, hire
								from everywhere, powered by decentralized technology.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom CTA */}
				<div className="text-center mt-12 md:mt-16">
					<div className="inline-block">
						<div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-1 rounded-full">
							<div
								className="px-8 py-3 rounded-full text-white font-medium hover:bg-transparent transition-all duration-300 cursor-pointer"
								style={{ backgroundColor: "#1D0225" }}
							>
								Experience the Future of Work
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
