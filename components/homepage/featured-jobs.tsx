"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	TrendingUp,
	ArrowRight,
	Star,
	Clock,
	DollarSign,
	User,
	Bot,
	Users,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function FeaturedJobs() {
	const jobs = [
		{
			title: "React Developer for DeFi Platform",
			budget: "2,500 HBAR",
			client: "CryptoStartup",
			skills: ["React", "TypeScript", "Web3"],
			proposals: 12,
			urgent: true,
			type: "Human + AI",
		},
		{
			title: "AI Content Generation Agent",
			budget: "1,800 HBAR",
			client: "ContentCorp",
			skills: ["GPT-4", "Content Strategy", "API"],
			proposals: 8,
			urgent: false,
			type: "AI Agent",
		},
		{
			title: "Smart Contract Development",
			budget: "3,200 HBAR",
			client: "BlockchainLabs",
			skills: ["Solidity", "Hedera", "Security"],
			proposals: 15,
			urgent: true,
			type: "Human",
		},
	];

	return (
		<section className="relative py-20 bg-gradient-to-br from-[#1D0225] via-[#15011a] to-[#2b0340] overflow-hidden">
			{/* Decorative background accents */}
			<motion.div
				className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-purple-600 opacity-30 blur-3xl"
				animate={{ y: [0, 30, 0] }}
				transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-pink-500 opacity-20 blur-3xl"
				animate={{ y: [0, -25, 0] }}
				transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
			/>

			<div className="container mx-auto px-4 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 space-y-4 md:space-y-0">
					<h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
						<TrendingUp className="w-8 h-8 text-[#FA5F04]" />
						Featured Jobs
					</h2>
					<Link
						href="/jobs"
						className="text-[#FA5F04] hover:text-[#FF7B47] font-medium group transition-all duration-300 flex items-center gap-1"
					>
						View All Jobs
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Link>
				</div>

				{/* Jobs grid */}
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{jobs.map((job, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							viewport={{ once: true }}
						>
							<Link href="/jobs">
								<Card className="cursor-pointer group relative overflow-hidden border border-purple-500/20 hover:border-[#FA5F04] bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-[#FA5F04]/30">
									{/* Urgent Badge */}
									{job.urgent && (
										<div className="absolute top-4 right-4">
											<Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg">
												<Clock className="w-3 h-3 mr-1" />
												Urgent
											</Badge>
										</div>
									)}

									{/* Job type badge */}
									<div className="absolute top-4 left-4">
										<Badge
											className={`${
												job.type === "AI Agent"
													? "bg-purple-200 text-purple-700"
													: job.type === "Human + AI"
													? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800"
													: "bg-green-200 text-green-800"
											} shadow-sm`}
										>
											{job.type === "AI Agent" && <Bot className="w-3 h-3 mr-1" />}
											{job.type === "Human + AI" && (
												<Users className="w-3 h-3 mr-1" />
											)}
											{job.type === "Human" && <User className="w-3 h-3 mr-1" />}
											{job.type}
										</Badge>
									</div>

									<CardHeader className="pt-12">
										<div className="flex items-start justify-between">
											<CardTitle className="text-lg md:text-xl text-white line-clamp-2 group-hover:text-[#FA5F04] transition-colors duration-300">
												{job.title}
											</CardTitle>
											<Badge className="bg-gradient-to-r from-green-200 to-green-300 text-green-800 font-semibold shadow-sm ml-2">
												<DollarSign className="w-3 h-3 mr-1" />
												{job.budget}
											</Badge>
										</div>

										{/* Client info */}
										<div className="flex items-center space-x-2 text-sm text-gray-300 mt-2">
											<Avatar className="w-7 h-7 ring-2 ring-purple-200">
												<AvatarFallback className="text-xs bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800 font-semibold">
													{job.client[0]}
												</AvatarFallback>
											</Avatar>
											<span className="font-medium">{job.client}</span>
											<div className="w-1 h-1 bg-gray-400 rounded-full" />
											<div className="flex items-center">
												<Star className="w-3 h-3 text-yellow-400 mr-1" />
												<span>4.8</span>
											</div>
										</div>
									</CardHeader>

									<CardContent>
										{/* Skills */}
										<div className="flex flex-wrap gap-2 mb-4">
											{job.skills.map((skill, skillIndex) => (
												<Badge
													key={skillIndex}
													variant="outline"
													className="text-xs text-gray-200 border-gray-500/30 hover:bg-[#FA5F04]/20 hover:text-[#FA5F04] transition-colors"
												>
													{skill}
												</Badge>
											))}
										</div>

										{/* Proposals & time */}
										<div className="flex items-center justify-between text-xs text-gray-400">
											<span>{job.proposals} proposals</span>
											<div className="flex items-center">
												<Clock className="w-3 h-3 mr-1" />
												<span>2 hours ago</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
