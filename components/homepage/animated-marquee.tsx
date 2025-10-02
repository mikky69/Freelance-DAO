"use client";

import { Star, Zap, Shield, Users, Award, Rocket } from "lucide-react";

export function AnimatedMarquee() {
	const marqueeItems = [
		{ text: "Decentralized Freelancing", icon: Users },
		{ text: "Smart Contract Payments", icon: Shield },
		{ text: "AI Agent Integration", icon: Zap },
		{ text: "Secure Escrow", icon: Shield },
		{ text: "Instant Payouts", icon: Rocket },
		{ text: "Global Talent Pool", icon: Users },
		{ text: "Transparent Reviews", icon: Star },
		{ text: "DAO Governance", icon: Award },
		{ text: "Perfect Matching", icon: Zap },
		{ text: "99% Success Rate", icon: Star },
	];

	return (
		<section
			className="py-6 md:py-8 overflow-hidden border-y border-purple-500/20 relative"
			style={{ backgroundColor: "#1D0225" }}
		>
			{/* Background gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-[#1D0225] via-purple-900/10 to-[#1D0225]"></div>

			{/* Background decorative elements */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-2 left-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-purple-500/30 to-transparent blur-xl animate-pulse"></div>
				<div className="absolute bottom-2 right-10 w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-orange-500/30 to-transparent blur-xl animate-pulse delay-700"></div>
			</div>

			<div className="relative z-10">
				{/* Gradient fade edges */}
				<div className="absolute left-0 top-0 w-8 md:w-16 h-full bg-gradient-to-r from-[#1D0225] to-transparent z-20"></div>
				<div className="absolute right-0 top-0 w-8 md:w-16 h-full bg-gradient-to-l from-[#1D0225] to-transparent z-20"></div>

				<div className="flex animate-marquee whitespace-nowrap">
					{/* First set */}
					{marqueeItems.map((item, index) => {
						const IconComponent = item.icon;
						return (
							<div
								key={index}
								className="inline-flex items-center mx-4 md:mx-8 text-sm md:text-lg font-semibold group hover:scale-105 transition-transform duration-300"
							>
								<IconComponent
									className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:rotate-12 transition-transform duration-300"
									style={{ color: "#FA5F04" }}
								/>
								<span
									className="bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
									style={{
										backgroundImage: "linear-gradient(45deg, #FF068D, #AE16A7)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
									}}
								>
									{item.text}
								</span>
								<div className="ml-4 md:ml-6 w-1 h-1 md:w-2 md:h-2 rounded-full bg-purple-400 opacity-50"></div>
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{marqueeItems.map((item, index) => {
						const IconComponent = item.icon;
						return (
							<div
								key={`duplicate-${index}`}
								className="inline-flex items-center mx-4 md:mx-8 text-sm md:text-lg font-semibold group hover:scale-105 transition-transform duration-300"
							>
								<IconComponent
									className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:rotate-12 transition-transform duration-300"
									style={{ color: "#FA5F04" }}
								/>
								<span
									className="bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
									style={{
										backgroundImage: "linear-gradient(45deg, #FF068D, #AE16A7)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
									}}
								>
									{item.text}
								</span>
								<div className="ml-4 md:ml-6 w-1 h-1 md:w-2 md:h-2 rounded-full bg-purple-400 opacity-50"></div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
