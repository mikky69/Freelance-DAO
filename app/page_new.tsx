"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { AnimatedMarquee } from "@/components/landing/animated-marquee";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { TrustedPartnersSection } from "@/components/landing/trusted-partners-section";
import { ExplainerVideoSection } from "@/components/landing/explainer-video-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function HomePage() {
	return (
		<div className="min-h-screen" style={{ backgroundColor: "#1D0225" }}>
			<HeroSection />
			<AnimatedMarquee />
			<TestimonialsSection />
			<TrustedPartnersSection />
			<ExplainerVideoSection />
			<FeaturesSection />
			<FaqSection />
			<FinalCtaSection />
		</div>
	);
}
