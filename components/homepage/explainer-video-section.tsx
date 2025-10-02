"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowRight, Video, Users, Clock } from "lucide-react";
import { useState } from "react";

export function ExplainerVideoSection() {
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlayVideo = () => {
		setIsPlaying(true);
		// Here you would integrate with your video player
		console.log("Playing video...");
	};

	return (
		<section className="py-20">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							See FreeLanceDAO in Action
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Watch how our decentralized platform revolutionizes freelancing
							with AI integration and smart contracts
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Video Player */}
						<div className="relative group">
							<div
								className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 cursor-pointer transition-all duration-300 group-hover:scale-105"
								style={{
									backgroundColor: "rgba(174, 22, 167, 0.1)",
									borderColor: "#FF068D",
								}}
								onClick={handlePlayVideo}
							>
								{/* Video Thumbnail/Placeholder */}
								<div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
									<div className="text-center">
										<div
											className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-2xl ${
												isPlaying ? "animate-pulse" : "group-hover:scale-110"
											}`}
											style={{ backgroundColor: "#FA5F04" }}
										>
											{isPlaying ? (
												<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											) : (
												<Play className="w-12 h-12 text-white ml-1" />
											)}
										</div>
										<p className="text-white font-semibold text-lg group-hover:text-orange-200 transition-colors duration-300">
											{isPlaying ? "Loading..." : "Watch Demo"}
										</p>
									</div>
								</div>

								{/* Overlay Effects */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								{/* Floating Elements */}
								<div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
									<div className="flex items-center gap-2 text-white text-sm">
										<Clock className="w-4 h-4" />
										<span>3:45</span>
									</div>
								</div>
							</div>

							{/* Glow Effect */}
							<div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-pink-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
						</div>

						{/* Video Description */}
						<div className="space-y-6">
							<h3 className="text-2xl md:text-3xl font-bold text-white">
								Experience the Future of Freelancing
							</h3>
							<p className="text-lg text-gray-300 leading-relaxed">
								Discover how FreeLanceDAO combines human expertise with AI
								capabilities, ensuring secure payments through smart contracts
								while maintaining the personal touch that makes great projects
								successful.
							</p>

							{/* Feature Highlights */}
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
										style={{ backgroundColor: "#AE16A7" }}
									>
										<Users className="w-4 h-4 text-white" />
									</div>
									<div>
										<h4 className="text-white font-semibold mb-1">
											Global Talent Network
										</h4>
										<p className="text-gray-400 text-sm">
											Connect with 50,000+ verified freelancers worldwide
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
										style={{ backgroundColor: "#FA5F04" }}
									>
										<Video className="w-4 h-4 text-white" />
									</div>
									<div>
										<h4 className="text-white font-semibold mb-1">
											AI-Powered Matching
										</h4>
										<p className="text-gray-400 text-sm">
											Get matched with the perfect talent using advanced AI
											algorithms
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
										style={{ backgroundColor: "#FF068D" }}
									>
										<Clock className="w-4 h-4 text-white" />
									</div>
									<div>
										<h4 className="text-white font-semibold mb-1">
											Instant Smart Payments
										</h4>
										<p className="text-gray-400 text-sm">
											Secure escrow and automatic payment release upon
											completion
										</p>
									</div>
								</div>
							</div>

							{/* CTA Button */}
							<div className="pt-4">
								<Button
									size="lg"
									className="text-lg px-8 py-6 shadow-2xl transition-all duration-300 hover:scale-105"
									style={{ backgroundColor: "#AE16A7", color: "white" }}
								>
									Start Your Journey
									<ArrowRight className="w-5 h-5 ml-2" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
