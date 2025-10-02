"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Star,
	Quote,
	ChevronLeft,
	ChevronRight,
	Award,
	Verified,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Testimonial {
	name: string;
	role: string;
	company: string;
	avatar: string;
	content: string;
	rating: number;
	earnings?: string;
	projectsCompleted?: number;
	verified: boolean;
}

export function TestimonialsSection() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);

	const testimonials: Testimonial[] = [
		{
			name: "Sarah Chen",
			role: "Senior Full-Stack Developer",
			company: "TechStart Inc.",
			avatar: "SC",
			content:
				"FreeLanceDAO completely transformed my freelancing journey. The transparent smart contract payments and AI-powered project matching have saved me over 20 hours per week. I've increased my income by 150% since joining.",
			rating: 5,
			earnings: "$125K+",
			projectsCompleted: 47,
			verified: true,
		},
		{
			name: "Marcus Rodriguez",
			role: "Tech Startup Founder",
			company: "InnovateLabs",
			avatar: "MR",
			content:
				"Finding the right talent used to be our biggest challenge. FreeLanceDAO's hybrid AI-human teams delivered a complex blockchain project 30% faster than traditional methods. The quality exceeded all expectations.",
			rating: 5,
			earnings: "$2.3M",
			projectsCompleted: 23,
			verified: true,
		},
		{
			name: "Emma Thompson",
			role: "AI Agent Developer",
			company: "ML Solutions",
			avatar: "ET",
			content:
				"My AI agents now generate passive income 24/7. The seamless integration with FreeLanceDAO's ecosystem allowed me to scale from $5K to $50K monthly revenue. The platform's support for AI agents is unmatched.",
			rating: 5,
			earnings: "$50K/mo",
			projectsCompleted: 89,
			verified: true,
		},
		{
			name: "David Kim",
			role: "UX/UI Designer",
			company: "DesignCraft",
			avatar: "DK",
			content:
				"The reputation system and on-chain reviews gave me credibility from day one. Clients trust the platform's verification process, and I've landed high-value projects consistently. Best decision for my career.",
			rating: 5,
			earnings: "$95K+",
			projectsCompleted: 34,
			verified: true,
		},
	];

	// Auto-play functionality
	useEffect(() => {
		if (isAutoPlaying) {
			const interval = setInterval(() => {
				setCurrentSlide((prev) => (prev + 1) % testimonials.length);
			}, 5000);
			return () => clearInterval(interval);
		}
	}, [isAutoPlaying, testimonials.length]);

	const nextSlide = () => {
		setIsAutoPlaying(false);
		setCurrentSlide((prev) => (prev + 1) % testimonials.length);
	};

	const prevSlide = () => {
		setIsAutoPlaying(false);
		setCurrentSlide(
			(prev) => (prev - 1 + testimonials.length) % testimonials.length
		);
	};

	const goToSlide = (index: number) => {
		setIsAutoPlaying(false);
		setCurrentSlide(index);
	};

	return (
		<section className="py-24 relative overflow-hidden">
			{/* Enhanced Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10"></div>
				<div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Enhanced Header */}
				<div className="text-center mb-20">
					<div
						className="inline-flex items-center px-6 py-3 rounded-full mb-6 border border-orange-500/30"
						style={{ backgroundColor: "rgba(250, 95, 4, 0.1)" }}
					>
						<Award className="w-5 h-5 mr-2" style={{ color: "#FA5F04" }} />
						<span className="text-orange-300 font-semibold">
							Success Stories
						</span>
					</div>

					<h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
						What Our{" "}
						<span
							className="bg-gradient-to-r bg-clip-text text-transparent"
							style={{
								backgroundImage: "linear-gradient(45deg, #FA5F04, #FF068D)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Community
						</span>{" "}
						Says
					</h2>
					<p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
						Join over{" "}
						<span className="font-bold text-white">50,000+ professionals</span>{" "}
						who've transformed their careers with FreeLanceDAO
					</p>
				</div>

				{/* Enhanced Testimonials Slider */}
				<div className="relative max-w-6xl mx-auto">
					<div className="overflow-hidden rounded-3xl">
						<div
							className="flex transition-transform duration-700 ease-out"
							style={{ transform: `translateX(-${currentSlide * 100}%)` }}
						>
							{testimonials.map((testimonial, index) => (
								<div key={index} className="w-full flex-shrink-0 px-6">
									<Card
										className="relative overflow-hidden border-2 shadow-2xl backdrop-blur-xl hover:scale-[1.02] transition-all duration-500 group"
										style={{
											backgroundColor: "rgba(0, 0, 0, 0.4)",
											borderColor: "#AE16A7",
											backdropFilter: "blur(20px)",
										}}
									>
										{/* Gradient overlay */}
										<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

										<CardContent className="p-10 relative z-10">
											{/* Quote icon and rating */}
											<div className="flex items-center justify-between mb-8">
												<Quote
													className="w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
													style={{ color: "#FF068D" }}
												/>
												<div className="flex items-center space-x-1">
													{[...Array(testimonial.rating)].map((_, i) => (
														<Star
															key={i}
															className="w-6 h-6 fill-current animate-pulse"
															style={{
																color: "#FA5F04",
																animationDelay: `${i * 100}ms`,
															}}
														/>
													))}
												</div>
											</div>

											{/* Content */}
											<blockquote className="text-xl md:text-2xl text-white mb-10 leading-relaxed font-light italic group-hover:text-gray-100 transition-colors duration-300">
												"{testimonial.content}"
											</blockquote>

											{/* Stats */}
											<div className="flex items-center justify-center space-x-8 mb-8 py-6 border-t border-b border-gray-700/50">
												<div className="text-center">
													<div className="text-2xl font-bold text-white mb-1">
														{testimonial.earnings}
													</div>
													<div className="text-gray-400 text-sm">
														Total Earned
													</div>
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-white mb-1">
														{testimonial.projectsCompleted}
													</div>
													<div className="text-gray-400 text-sm">Projects</div>
												</div>
												<div className="text-center">
													<div
														className="text-2xl font-bold"
														style={{ color: "#FA5F04" }}
													>
														100%
													</div>
													<div className="text-gray-400 text-sm">
														Success Rate
													</div>
												</div>
											</div>

											{/* Profile */}
											<div className="flex items-center justify-center space-x-6">
												<Avatar className="w-20 h-20 border-4 border-purple-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-300">
													<AvatarFallback className="text-white font-bold text-xl bg-gradient-to-br from-purple-500 to-pink-500">
														{testimonial.avatar}
													</AvatarFallback>
												</Avatar>
												<div className="text-center">
													<div className="flex items-center gap-2 justify-center mb-2">
														<h4 className="text-2xl font-bold text-white">
															{testimonial.name}
														</h4>
														{testimonial.verified && (
															<Verified className="w-6 h-6 text-blue-400 fill-current" />
														)}
													</div>
													<p className="text-lg" style={{ color: "#FA5F04" }}>
														{testimonial.role}
													</p>
													<p className="text-gray-400 text-sm">
														{testimonial.company}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							))}
						</div>
					</div>

					{/* Enhanced Navigation Buttons */}
					<button
						onClick={prevSlide}
						className="absolute left-4 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-xl shadow-2xl group"
						style={{
							backgroundColor: "rgba(174, 22, 167, 0.2)",
							borderColor: "#AE16A7",
						}}
					>
						<ChevronLeft
							className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
							style={{ color: "#AE16A7" }}
						/>
					</button>
					<button
						onClick={nextSlide}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-xl shadow-2xl group"
						style={{
							backgroundColor: "rgba(174, 22, 167, 0.2)",
							borderColor: "#AE16A7",
						}}
					>
						<ChevronRight
							className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
							style={{ color: "#AE16A7" }}
						/>
					</button>

					{/* Enhanced Dots Indicator */}
					<div className="flex justify-center space-x-3 mt-12">
						{testimonials.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`h-4 rounded-full transition-all duration-300 hover:scale-110 ${
									currentSlide === index
										? "w-12 shadow-lg"
										: "w-4 opacity-50 hover:opacity-75"
								}`}
								style={{
									backgroundColor:
										currentSlide === index ? "#FF068D" : "#AE16A7",
								}}
							/>
						))}
					</div>

					{/* Auto-play indicator */}
					<div className="text-center mt-6">
						<button
							onClick={() => setIsAutoPlaying(!isAutoPlaying)}
							className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
						>
							{isAutoPlaying ? "⏸️ Pause" : "▶️ Play"} Auto-slide
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
