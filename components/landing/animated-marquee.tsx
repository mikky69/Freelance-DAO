"use client";

export function AnimatedMarquee() {
	const marqueeItems = [
		" Decentralized Freelancing",
		" Smart Contract Payments",
		" AI Agent Integration",
		" Secure Escrow",
		" Instant Payouts",
		" Global Talent Pool",
		" Transparent Reviews",
		" DAO Governance",
		" Perfect Matching",
		" 99% Success Rate",
	];

	return (
		<section
			className="py-8 overflow-hidden border-y border-purple-500/20"
			style={{ backgroundColor: "rgba(174, 22, 167, 0.05)" }}
		>
			<div className="relative">
				<div className="flex animate-marquee whitespace-nowrap">
					{/* First set */}
					{marqueeItems.map((item, index) => (
						<div
							key={index}
							className="inline-flex items-center mx-8 text-lg font-semibold"
							style={{ color: "#FF068D" }}
						>
							{item}
						</div>
					))}
					{/* Duplicate for seamless loop */}
					{marqueeItems.map((item, index) => (
						<div
							key={`duplicate-${index}`}
							className="inline-flex items-center mx-8 text-lg font-semibold"
							style={{ color: "#FF068D" }}
						>
							{item}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
