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
		<section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-3xl font-bold text-slate-800 text-shadow">
						<TrendingUp className="w-8 h-8 inline mr-3 text-blue-500" />
						Featured Jobs
					</h2>
					<Link
						href="/jobs"
						className="text-blue-500 hover:text-blue-600 font-medium group transition-colors duration-200"
					>
						View All Jobs
						<ArrowRight className="w-4 h-4 inline ml-1 group-hover:translate-x-1 transition-transform duration-200" />
					</Link>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{jobs.map((job, index) => (
						<Link href="/jobs" key={index}>
							<Card className="card-hover cursor-pointer glass-effect group relative overflow-hidden">
								{job.urgent && (
									<div className="absolute top-4 right-4">
										<Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg">
											<Clock className="w-3 h-3 mr-1" />
											Urgent
										</Badge>
									</div>
								)}
								<div className="absolute top-4 left-4">
									<Badge
										className={`${
											job.type === "AI Agent"
												? "bg-purple-100 text-purple-700"
												: job.type === "Human + AI"
												? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
												: "bg-green-100 text-green-700"
										} shadow-sm`}
									>
										{job.type === "AI Agent" && (
											<Bot className="w-3 h-3 mr-1" />
										)}
										{job.type === "Human + AI" && (
											<Users className="w-3 h-3 mr-1" />
										)}
										{job.type === "Human" && <User className="w-3 h-3 mr-1" />}
										{job.type}
									</Badge>
								</div>
								<CardHeader className="pt-12">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
											{job.title}
										</CardTitle>
										<Badge
											variant="secondary"
											className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 font-semibold shadow-sm ml-2"
										>
											<DollarSign className="w-3 h-3 mr-1" />
											{job.budget}
										</Badge>
									</div>
									<div className="flex items-center space-x-2 text-sm text-slate-600">
										<Avatar className="w-6 h-6 ring-2 ring-blue-100">
											<AvatarFallback className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold">
												{job.client[0]}
											</AvatarFallback>
										</Avatar>
										<span className="font-medium">{job.client}</span>
										<div className="w-1 h-1 bg-slate-400 rounded-full" />
										<div className="flex items-center">
											<Star className="w-3 h-3 text-yellow-500 mr-1" />
											<span>4.8</span>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2 mb-4">
										{job.skills.map((skill, skillIndex) => (
											<Badge
												key={skillIndex}
												variant="outline"
												className="text-xs hover:bg-blue-50 transition-colors duration-200"
											>
												{skill}
											</Badge>
										))}
									</div>
									<div className="flex items-center justify-between text-sm text-slate-500">
										<span>{job.proposals} proposals</span>
										<div className="flex items-center">
											<Clock className="w-3 h-3 mr-1" />
											<span>2 hours ago</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
