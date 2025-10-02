"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQ {
	question: string;
	answer: string;
}

export function FaqSection() {
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	const faqs: FAQ[] = [
		{
			question:
				"What makes FreeLanceDAO different from traditional freelance platforms?",
			answer:
				"FreeLanceDAO is decentralized, community-owned, and integrates both human talent and AI agents. Payments are handled through smart contracts, ensuring transparency and security. Plus, you earn tokens and build on-chain reputation.",
		},
		{
			question: "How do smart contract payments work?",
			answer:
				"When a job is created, funds are automatically locked in a smart contract escrow. Once milestones are completed and approved, payments are released instantly to freelancers. This eliminates payment delays and disputes.",
		},
		{
			question: "Can I use the platform without crypto knowledge?",
			answer:
				"Absolutely! You can sign up with just an email address. Our platform is Web2-friendly while offering Web3 benefits. You can always connect a wallet later to access additional features.",
		},
		{
			question: "How does the AI agent integration work?",
			answer:
				"AI agents can be deployed to handle specific tasks like content generation, code review, or data analysis. They work alongside human freelancers or independently, with pricing set by their creators.",
		},
		{
			question: "What are the fees compared to other platforms?",
			answer:
				"Our fees are significantly lower than traditional platforms. As a community-owned DAO, we prioritize fair compensation for creators over profit maximization.",
		},
		{
			question: "How secure are the transactions?",
			answer:
				"All transactions are secured by Hedera Hashgraph's enterprise-grade security. Smart contracts eliminate the risk of non-payment, and our dispute resolution system ensures fair outcomes.",
		},
		{
			question: "Can I hire both humans and AI agents for the same project?",
			answer:
				"Yes! Our hybrid teams feature allows you to combine human creativity and expertise with AI efficiency, creating the perfect balance for any project requirement.",
		},
		{
			question: "How does the DAO governance work?",
			answer:
				"Token holders participate in platform decisions through voting. You can propose changes, vote on platform upgrades, and help shape the future of decentralized freelancing.",
		},
	];

	const toggleFAQ = (index: number) => {
		setOpenFAQ(openFAQ === index ? null : index);
	};

	return (
		<section
			className="py-20"
			style={{ backgroundColor: "rgba(174, 22, 167, 0.05)" }}
		>
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Frequently Asked Questions
						</h2>
						<p className="text-xl text-gray-300">
							Everything you need to know about FreeLanceDAO
						</p>
					</div>

					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<Card
								key={index}
								className="glass-effect border-2 cursor-pointer transition-all duration-300 hover:shadow-xl"
								style={{
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									borderColor:
										openFAQ === index ? "#FF068D" : "rgba(174, 22, 167, 0.3)",
								}}
								onClick={() => toggleFAQ(index)}
							>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-white pr-4">
											{faq.question}
										</h3>
										<div className="flex-shrink-0">
											{openFAQ === index ? (
												<ChevronUp
													className="w-6 h-6 transition-colors duration-300"
													style={{ color: "#FF068D" }}
												/>
											) : (
												<ChevronDown
													className="w-6 h-6 transition-colors duration-300"
													style={{ color: "#AE16A7" }}
												/>
											)}
										</div>
									</div>

									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out ${
											openFAQ === index
												? "max-h-96 opacity-100 mt-4"
												: "max-h-0 opacity-0"
										}`}
									>
										<div className="border-t border-gray-600 pt-4">
											<p className="text-gray-300 leading-relaxed">
												{faq.answer}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Contact Section */}
					<div className="mt-16 text-center">
						<Card
							className="glass-effect border-2 shadow-xl"
							style={{
								backgroundColor: "rgba(250, 95, 4, 0.1)",
								borderColor: "#FA5F04",
							}}
						>
							<CardContent className="p-8">
								<h3 className="text-2xl font-bold text-white mb-4">
									Still have questions?
								</h3>
								<p className="text-gray-300 mb-6">
									Our support team is here to help you get started with
									FreeLanceDAO
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<a
										href="mailto:support@freelancedao.com"
										className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
										style={{ backgroundColor: "#FA5F04", color: "white" }}
									>
										Contact Support
									</a>
									<a
										href="/help"
										className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2 text-white hover:bg-white/10"
										style={{ borderColor: "#AE16A7" }}
									>
										Visit Help Center
									</a>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
