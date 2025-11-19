import Header from "@/components/layout/header"
import Hero from "@/components/home/hero"
import HowItWorks from "@/components/home/how-it-works"
import Community from "@/components/home/community"
import Testimonials from "@/components/home/testimonials"
import Footer from "@/components/layout/footer"

export const metadata = {
  title: "AuraSpace - Design Your Mood. Live Your Space.",
  description: "Create immersive digital environments tailored to your emotions and activities.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1E1E1E]">
      <Hero />
      <HowItWorks />
      <Community />
      <Testimonials />
      {/* <Footer /> */}
    </main>
  )
}
