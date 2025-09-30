import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Network,
	Mail,
	Wallet,
	Shield,
	Coins,
	Bot,
	Users,
	Heart,
} from "lucide-react";

export function WhyFreeLanceDAO() {
	return (
		<section className="py-16 bg-white/80 backdrop-blur-sm">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12 animate-slide-up">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-shadow">
						Why FreeLanceDAO?
					</h2>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					<Card className="border-blue-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<Network className="w-8 h-8 text-white" />
							</div>
							<CardTitle className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
								Decentralized & Community-Owned
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="border-green-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<div className="flex items-center space-x-1">
									<Mail className="w-4 h-4 text-white" />
									<Wallet className="w-4 h-4 text-white" />
								</div>
							</div>
							<CardTitle className="text-slate-800 group-hover:text-green-600 transition-colors duration-300">
								Web2-Friendly
							</CardTitle>
							<CardDescription className="text-slate-600">
								Email sign-up or wallet connect
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-purple-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<Shield className="w-8 h-8 text-white" />
							</div>
							<CardTitle className="text-slate-800 group-hover:text-purple-600 transition-colors duration-300">
								Transparent Payments
							</CardTitle>
							<CardDescription className="text-slate-600">
								Via smart contracts
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-orange-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<Coins className="w-8 h-8 text-white" />
							</div>
							<CardTitle className="text-slate-800 group-hover:text-orange-600 transition-colors duration-300">
								Token Rewards
							</CardTitle>
							<CardDescription className="text-slate-600">
								& on-chain reputation
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-indigo-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<div className="flex items-center space-x-1">
									<Bot className="w-4 h-4 text-white" />
									<Users className="w-4 h-4 text-white" />
								</div>
							</div>
							<CardTitle className="text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
								AI + Human Workflows
							</CardTitle>
							<CardDescription className="text-slate-600">
								Built in
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-pink-100 card-hover glass-effect group text-center">
						<CardHeader>
							<div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
								<Heart className="w-8 h-8 text-white" />
							</div>
							<CardTitle className="text-slate-800 group-hover:text-pink-600 transition-colors duration-300">
								Community First
							</CardTitle>
							<CardDescription className="text-slate-600">
								Built for the people
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</section>
	);
}
