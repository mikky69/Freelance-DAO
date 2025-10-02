"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export function FinalCtaSection() {
	return (
		<section
			className="py-20 relative overflow-hidden"
			style={{ backgroundColor: "rgba(174, 22, 167, 0.1)" }}
		>
			{/* Background Effects */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
			<div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-3xl"></div>

			<div className="container mx-auto px-4 text-center relative z-10">
				<h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
					Work. Hire. Govern.
				</h2>
				<p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
					Join the freelance platform built for the future and owned by the
					people who use it.
				</p>

				<div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
					<Link href="/onboarding">
						<Button
							size="lg"
							className="text-lg px-10 py-6 w-full sm:w-auto shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
							style={{ backgroundColor: "#FA5F04", color: "white" }}
						>
							🚀 Get Started
							<ArrowRight className="w-5 h-5 ml-2" />
						</Button>
					</Link>
					<Link href="/jobs">
						<Button
							size="lg"
							variant="outline"
							className="text-lg px-10 py-6 w-full sm:w-auto shadow-2xl hover:scale-105 transition-all duration-300 font-semibold border-2 text-white hover:bg-white/10"
							style={{ borderColor: "#AE16A7" }}
						>
							<Search className="w-5 h-5 mr-2" />
							Explore Jobs
						</Button>
					</Link>
				</div>

				{/* Final Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
					<div className="text-center">
						<div className="text-3xl md:text-4xl font-bold text-white mb-2">
							$2.5M+
						</div>
						<div className="text-gray-300 font-medium">Total Paid Out</div>
					</div>
					<div className="text-center">
						<div className="text-3xl md:text-4xl font-bold text-white mb-2">
							50K+
						</div>
						<div className="text-gray-300 font-medium">Active Users</div>
					</div>
					<div className="text-center">
						<div className="text-3xl md:text-4xl font-bold text-white mb-2">
							99%
						</div>
						<div className="text-gray-300 font-medium">Success Rate</div>
					</div>
					<div className="text-center">
						<div className="text-3xl md:text-4xl font-bold text-white mb-2">
							24/7
						</div>
						<div className="text-gray-300 font-medium">Global Support</div>
					</div>
				</div>
			</div>
		</section>
	);
}
