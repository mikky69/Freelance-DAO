"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
	_id: string;
	title: string;
	description: string;
	budget: {
		amount: number;
		currency: string;
	};
	client: {
		fullname: string;
		avatar?: string;
	};
	skills: string[];
	proposals: any[];
	urgency: string;
	category: string;
	createdAt: string;
}

export function FeaturedJobs() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFeaturedJobs = async () => {
			try {
				const res = await fetch('/api/jobs?featured=true&limit=3');
				const data = await res.json();
				if (res.ok) {
					setJobs(data.jobs || []);
				}
			} catch (error) {
				console.error("Failed to fetch featured jobs", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedJobs();
	}, []);

	const getJobType = (job: Job) => {
		// Logic to determine job type based on category or other factors
		// For now, we can infer from category or default to Human
		if (job.category === 'ai-agents' || job.title.toLowerCase().includes('agent')) return "AI Agent";
		if (job.title.toLowerCase().includes('hybrid')) return "Human + AI";
		return "Human";
	};

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
		
		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
		return `${Math.floor(diffInHours / 24)} days ago`;
	};

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
					{loading ? (
						// Loading Skeletons
						[...Array(3)].map((_, i) => (
							<Card key={i} className="bg-white/5 border-purple-500/20">
								<CardHeader className="pt-12">
									<Skeleton className="h-6 w-3/4 mb-2 bg-purple-500/20" />
									<Skeleton className="h-4 w-1/2 bg-purple-500/20" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full bg-purple-500/20" />
								</CardContent>
							</Card>
						))
					) : jobs.length > 0 ? (
						jobs.map((job, index) => {
							const jobType = getJobType(job);
							return (
								<motion.div
									key={job._id}
									initial={{ opacity: 0, y: 40 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.2 }}
									viewport={{ once: true }}
								>
									<Card className="group relative overflow-hidden border border-purple-500/20 hover:border-[#FA5F04] bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-[#FA5F04]/30 h-full flex flex-col justify-between">
										{/* Urgent Badge */}
										{job.urgency === 'high' && (
											<div className="absolute top-4 right-4 z-10">
												<Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg">
													<Clock className="w-3 h-3 mr-1" />
													Urgent
												</Badge>
											</div>
										)}

										{/* Job type badge */}
										<div className="absolute top-4 left-4 z-10">
											<Badge
												className={`${
													jobType === "AI Agent"
														? "bg-purple-200 text-purple-700"
														: jobType === "Human + AI"
														? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800"
														: "bg-green-200 text-green-800"
												} shadow-sm`}
											>
												{jobType === "AI Agent" && <Bot className="w-3 h-3 mr-1" />}
												{jobType === "Human + AI" && (
													<Users className="w-3 h-3 mr-1" />
												)}
												{jobType === "Human" && <User className="w-3 h-3 mr-1" />}
												{jobType}
											</Badge>
										</div>

										<CardHeader className="pt-12 pb-2">
											<div className="flex items-start justify-between">
												<Link href={`/jobs/${job._id}`} className="hover:underline decoration-[#FA5F04]">
													<CardTitle className="text-lg md:text-xl text-white line-clamp-2 group-hover:text-[#FA5F04] transition-colors duration-300 h-14">
														{job.title}
													</CardTitle>
												</Link>
											</div>
											<div className="mt-2">
												<Badge className="bg-gradient-to-r from-green-200 to-green-300 text-green-800 font-semibold shadow-sm">
													<DollarSign className="w-3 h-3 mr-1" />
													{job.budget.amount.toLocaleString()} {job.budget.currency}
												</Badge>
											</div>

											{/* Client info */}
											<div className="flex items-center space-x-2 text-sm text-gray-300 mt-3">
												<Avatar className="w-7 h-7 ring-2 ring-purple-200">
													<AvatarFallback className="text-xs bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800 font-semibold">
														{job.client?.fullname?.[0] || 'C'}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium truncate max-w-[120px]">{job.client?.fullname || 'Client'}</span>
												<div className="w-1 h-1 bg-gray-400 rounded-full" />
												<div className="flex items-center">
													<Star className="w-3 h-3 text-yellow-400 mr-1" />
													<span>4.8</span>
												</div>
											</div>
										</CardHeader>

										<CardContent>
											{/* Description */}
											<p className="text-sm text-gray-400 line-clamp-3 mb-4 h-15">
												{job.description || "No description provided."}
											</p>

											{/* Skills */}
											<div className="flex flex-wrap gap-2 mb-4 h-16 overflow-hidden content-start">
												{job.skills.slice(0, 3).map((skill, skillIndex) => (
													<Badge
														key={skillIndex}
														variant="outline"
														className="text-xs text-gray-200 border-gray-500/30 hover:bg-[#FA5F04]/20 hover:text-[#FA5F04] transition-colors"
													>
														{skill}
													</Badge>
												))}
												{job.skills.length > 3 && (
													<Badge variant="outline" className="text-xs text-gray-400 border-gray-500/30">
														+{job.skills.length - 3}
													</Badge>
												)}
											</div>

											{/* Proposals & time */}
											<div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-purple-500/10">
												<span>{job.proposals?.length || 0} proposals</span>
												<div className="flex items-center">
													<Clock className="w-3 h-3 mr-1" />
													<span>{getTimeAgo(job.createdAt)}</span>
												</div>
											</div>
										</CardContent>

										<CardFooter className="pt-0 pb-6 px-6">
											<Link href={`/jobs/${job._id}`} className="w-full">
												<Button className="w-full bg-[#FA5F04] hover:bg-[#FF7B47] text-white transition-colors">
													Apply Now
												</Button>
											</Link>
										</CardFooter>
									</Card>
								</motion.div>
							);
						})
					) : (
						<div className="col-span-full text-center text-gray-400 py-10">
							<p>No featured jobs available at the moment.</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
