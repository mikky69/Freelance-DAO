"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle, Mail, LifeBuoy } from "lucide-react";
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
		<section className="py-20 relative bg-gradient-to-b from-[#1D0225] via-[#2A0632] to-[#1D0225]">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					{/* Section Header */}
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 flex justify-center items-center gap-3">
							<HelpCircle className="w-8 h-8 text-[#FA5F04]" />
							Frequently Asked Questions
						</h2>
						<p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
							Everything you need to know about FreeLanceDAO
						</p>
					</div>

					{/* FAQ Cards */}
					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<Card
								key={index}
								className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
									openFAQ === index
										? "border-[#FF068D] shadow-xl"
										: "border-white/10 hover:border-[#AE16A7]"
								}`}
								style={{
									backgroundColor: "rgba(255,255,255,0.03)",
								}}
								onClick={() => toggleFAQ(index)}
							>
								<CardContent className="p-6">
									<div className="flex items-center justify-between cursor-pointer">
										<h3 className="text-lg md:text-xl font-semibold text-white pr-4">
											{faq.question}
										</h3>
										<div className="flex-shrink-0">
											{openFAQ === index ? (
												<ChevronUp className="w-6 h-6 text-[#FF068D] transition-colors" />
											) : (
												<ChevronDown className="w-6 h-6 text-[#AE16A7] transition-colors" />
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
										<div className="border-t border-white/10 pt-4">
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
					<div className="mt-20 text-center">
						<Card
							className="rounded-2xl shadow-xl border"
							style={{
								background:
									"linear-gradient(135deg, rgba(250,95,4,0.15), rgba(174,22,167,0.1))",
								borderColor: "rgba(250,95,4,0.4)",
							}}
						>
							<CardContent className="p-10">
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
										className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
										style={{ backgroundColor: "#FA5F04", color: "white" }}
									>
										<Mail className="w-5 h-5" />
										Contact Support
									</a>
									<a
										href="/help"
										className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border-2 text-white hover:bg-white/10"
										style={{ borderColor: "#AE16A7" }}
									>
										<LifeBuoy className="w-5 h-5" />
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
