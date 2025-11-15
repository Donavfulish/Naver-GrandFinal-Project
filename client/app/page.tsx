import Header from "@/components/header"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import Community from "@/components/community"
import Testimonials from "@/components/testimonials"
import Footer from "@/components/footer"

export const metadata = {
  title: "AuraSpace - Design Your Mood. Live Your Space.",
  description: "Create immersive digital environments tailored to your emotions and activities.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1E1E1E]">
      <Header />
      <Hero />
      <HowItWorks />
      <Community />
      <Testimonials />
      <Footer />
    </main>
  )
}
