"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
		<section className="relative min-h-screen flex items-center justify-center bg-[#1D0225] text-white overflow-hidden">
			{/* Grid Pattern Background */}
			<div
				className="absolute inset-0 opacity-60"
				style={{
					backgroundImage:
						"linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Gradient Overlay for Depth */}
			<div className="absolute inset-0 bg-gradient-to-b from-[#1D0225] via-[#1D0225]/95 to-[#1D0225]" />

			<div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center relative z-10">
				{/* Left Content */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="flex-1 text-center lg:text-left"
				>
					<h1 className="text-4xl md:text-6xl font-bold leading-tight">
						The Future of <span className="text-[#AE16A7]">Freelancing</span> is{" "}
						<span className="text-[#FA5F04]">Decentralized</span>
					</h1>
					<p className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0">
						FreelanceDAO is your Web3 Job Marketplace powered by smart
						contracts, escrow payments, and a trust-first reputation system.
					</p>

					<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
						<Button className="px-8 py-4 rounded-2xl text-lg font-semibold bg-[#AE16A7] hover:bg-[#FF068D] transition">
							Get Started
						</Button>
						<Button
							variant="outline"
							className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-[#FA5F04] text-[#FA5F04] hover:bg-[#FA5F04] hover:text-white transition"
						>
							Learn More
						</Button>
					</div>
				</motion.div>

				{/* Right Illustration */}
				<motion.div
					initial={{ opacity: 0, x: 60 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="flex-1 mt-12 lg:mt-0 flex justify-center lg:justify-end"
				>
					<div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
						<Image
							src="/images/freelance-hero-image.png"
							alt="FreelanceDAO illustration"
							fill
							priority
							className="object-contain"
						/>
					</div>
				</motion.div>
			</div>

			{/* Animated Floating Accent Shapes */}
			<motion.div
				className="absolute top-10 left-10 w-24 h-24 bg-[#FF068D] rounded-full opacity-20"
				animate={{ y: [0, 20, 0] }}
				transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute bottom-16 right-16 w-32 h-32 bg-[#FA5F04] rounded-full opacity-20"
				animate={{ y: [0, -25, 0] }}
				transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
			/>
		</section>
	);
}
