"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectRole: (role: "freelancer" | "client") => void;
	onLoginClick: () => void;
}

export function RoleSelectionModal({
	isOpen,
	onClose,
	onSelectRole,
	onLoginClick,
}: RoleSelectionModalProps) {
	const [selectedRole, setSelectedRole] = useState<"freelancer" | "client" | null>(null);

	const handleContinue = () => {
		if (selectedRole) {
			onSelectRole(selectedRole);
		}
	};

	const handleClose = (open: boolean) => {
		if (!open) {
			setSelectedRole(null);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className="sm:max-w-2xl border-[#AE16A7]/30 shadow-2xl p-0 overflow-hidden bg-[#1D0225] text-white"
			>
				<div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/5 to-[#FF068D]/5 pointer-events-none"></div>
				
				<div className="p-8 md:p-10 relative z-10">
					<DialogHeader className="mb-8">
						<DialogTitle className="text-center text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
							Join as a client or freelancer
						</DialogTitle>
					</DialogHeader>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
						{/* Client Card */}
						<div
							onClick={() => setSelectedRole("client")}
							className={cn(
								"relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:bg-[#AE16A7]/10",
								selectedRole === "client"
									? "border-[#AE16A7] bg-[#AE16A7]/10"
									: "border-[#AE16A7]/20 bg-transparent hover:border-[#AE16A7]/50"
							)}
						>
							<div className="flex justify-between items-start mb-4">
								<Briefcase className={cn(
									"w-8 h-8",
									selectedRole === "client" ? "text-[#AE16A7]" : "text-gray-400"
								)} />
								<div className={cn(
									"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
									selectedRole === "client" 
										? "border-[#AE16A7] bg-[#AE16A7]" 
										: "border-gray-500 bg-transparent"
								)}>
									{selectedRole === "client" && (
										<div className="w-2.5 h-2.5 rounded-full bg-white" />
									)}
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-2">
								I&apos;m a client, hiring for a project
							</h3>
						</div>

						{/* Freelancer Card */}
						<div
							onClick={() => setSelectedRole("freelancer")}
							className={cn(
								"relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:bg-[#FF068D]/10",
								selectedRole === "freelancer"
									? "border-[#FF068D] bg-[#FF068D]/10"
									: "border-[#AE16A7]/20 bg-transparent hover:border-[#FF068D]/50"
							)}
						>
							<div className="flex justify-between items-start mb-4">
								<Search className={cn(
									"w-8 h-8",
									selectedRole === "freelancer" ? "text-[#FF068D]" : "text-gray-400"
								)} />
								<div className={cn(
									"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
									selectedRole === "freelancer"
										? "border-[#FF068D] bg-[#FF068D]"
										: "border-gray-500 bg-transparent"
								)}>
									{selectedRole === "freelancer" && (
										<div className="w-2.5 h-2.5 rounded-full bg-white" />
									)}
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-2">
								I&apos;m a freelancer, looking for work
							</h3>
						</div>
					</div>

					<div className="flex flex-col items-center gap-4">
						<Button
							onClick={handleContinue}
							disabled={!selectedRole}
							className={cn(
								"w-full md:w-auto min-w-[200px] rounded-full text-base font-semibold py-6 transition-all duration-300",
								selectedRole
									? "bg-gradient-to-r from-[#AE16A7] to-[#FF068D] hover:shadow-lg hover:shadow-[#AE16A7]/25 text-white border-none"
									: "bg-gray-800 text-gray-500 cursor-not-allowed"
							)}
						>
							{selectedRole === "freelancer" 
								? "Apply as a Freelancer" 
								: selectedRole === "client" 
									? "Join as a Client" 
									: "Create Account"}
						</Button>

						<div className="text-sm text-gray-400 mt-2">
							Already have an account?{" "}
							<button 
								onClick={onLoginClick}
								className="text-[#AE16A7] hover:text-[#FF068D] font-medium transition-colors hover:underline"
							>
								Log In
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
