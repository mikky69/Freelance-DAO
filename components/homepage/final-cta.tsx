import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
	return (
		<section className="py-16 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden">
			<div className="absolute inset-0 bg-black/10" />
			<div className="container mx-auto px-4 text-center relative">
				<h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-shadow">
					Work. Hire. Govern.
				</h2>
				<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
					Join the freelance platform built for the future and owned by the
					people who use it.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/onboarding">
						<Button
							size="lg"
							variant="secondary"
							className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
						>
							👉 Get Started
						</Button>
					</Link>
					<Link href="/jobs">
						<Button
							size="lg"
							variant="outline"
							className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
						>
							👉 Explore Jobs
						</Button>
					</Link>
					<Link href="/dao">
						<Button
							size="lg"
							variant="outline"
							className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto shadow-xl interactive-scale font-semibold"
						>
							👉 Join the DAO
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
