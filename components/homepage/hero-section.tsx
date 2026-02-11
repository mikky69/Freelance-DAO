"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import WaveBackground from "../ui/WaveBackground";
import { BadgeCheck } from 'lucide-react'

export default function HeroSection() {
  return (
		<section className="relative min-h-screen flex items-center justify-center bg-white text-white overflow-hidden">
			<WaveBackground />

			<div className="w-full h-screen flex flex-col justify-center  items-center relative z-10">
				{/* Left Content */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }} 
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="flex flex-col gap-4 w-full h-full text-center justify-center items-center"
				>
					<div className="flex gap-6 ">
						<p className="text-[12px] text-black flex justify-center items-center gap-2" ><span><BadgeCheck size={12}/></span>500+ freelancers waiting to launch</p>
						<p className="text-[12px] text-black flex justify-center items-center gap-1" ><span><BadgeCheck size={12}/></span>300+ active community members</p>
					
					</div>
					<h1 className="text-5xl md:text-5xl text-black font-bold">
						Work Smarter. Pay Less. Earn More.
					</h1>
					<p className=" text-base  text-black text-center w-[50%] mx-auto lg:mx-0">
						The first freelance marketplace where humans and AI work together—delivering projects 40% faster at 30% lower cost.

					</p>

					<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
						<Button className="px-3 py-1 rounded-md text-base shadow-innerpurple bg-[#AE16A7]">
							Join the waitlist
						</Button>
						<Button
							variant="outline"
							className="px-3 py-1 shadow-innerLG rounded-md text-base bg-gray-100  text-black"
						>
							How it works
						</Button>
					</div>
				</motion.div>

				{/* Right Illustration */}
				{/* <motion.div
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
				</motion.div> */}
			</div>

			{/* Animated Floating Accent Shapes */}
			{/* <motion.div
				className="absolute top-10 left-10 w-24 h-24 bg-[#FF068D] rounded-full opacity-20"
				animate={{ y: [0, 20, 0] }}
				transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute bottom-16 right-16 w-32 h-32 bg-[#FA5F04] rounded-full opacity-20"
				animate={{ y: [0, -25, 0] }}
				transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
			/> */}
		</section>
	);
}
