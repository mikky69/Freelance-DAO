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
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }} 
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="flex flex-col gap-4 w-full h-full text-center justify-center items-center"
				>
					<div className="flex gap-6 ">
						<p className="text-[12px] text-black flex justify-center items-center gap-2" ><span><BadgeCheck size={14}/></span>500+ freelancers waiting to launch</p>
						<p className="text-[12px] text-black flex justify-center items-center gap-2" ><span><BadgeCheck size={14}/></span>300+ active community members</p>
					
					</div>
					<h1 className="text-5xl md:text-5xl text-black  font-italianno">
						Work Smarter. Pay Less. Earn More.
					</h1>
					<p className=" text-base  text-black text-center w-[50%] mx-auto lg:mx-0 font-inter">
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

				<div className="w-full flex justify-between items-center text-black px-8 mb-12">
					<div className="text-center flex flex-col gap-4 w-[25%]">
						<h1 className="text-6xl  font-italianno ">25K +</h1>
					<p className="text-[12px] text-gray-500">more than 25,000 projects has been completed on our platform.</p>
					</div>
					<div className="text-center flex flex-col gap-4 w-[25%]">
						<h1 className="text-6xl font-italianno  ">4.9/5</h1>
					<p className="text-[12px] text-gray-500">We have an avergae rating of 4.9/5. we have a high average rating.</p>
					</div>
					<div className="text-center flex flex-col gap-4 w-[25%]">
						<h1 className="text-6xl font-italianno  ">50K +</h1>
					<p className="text-[12px] text-gray-500">more than 50,000 freelance completely onboarded on our platform</p>
					</div>
				</div>
			</div>
		</section>
	);
}
