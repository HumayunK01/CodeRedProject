
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";

import { Testimonials } from "@/components/home/Testimonials";
import { Stats } from "@/components/home/Stats";
import { CTA } from "@/components/home/CTA";

const Home = () => {
  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <CTA />
    </div>
  );
};

export default Home;