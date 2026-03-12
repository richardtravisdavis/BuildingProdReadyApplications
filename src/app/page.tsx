import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CresoraLogo from "@/components/cresora-logo";
import FadeIn from "@/components/fade-in";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="bg-[#00273B] border-b border-[#003350]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <CresoraLogo size={32} />
            <span className="text-xl font-bold text-white">Cresora Commerce</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#FC6200] hover:bg-[#FC6200]/90 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center bg-[#00273B]">
        <p className="text-sm font-semibold text-[#68DDDC] uppercase tracking-widest mb-4">
          Streamlined at the Speed of AI
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl text-white">
          Stop Overpaying for Merchant Processing
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-300">
          Compare your current merchant processing costs against alternatives and
          discover how much you could save. Our ROI calculator gives you a clear,
          honest picture of your options.
        </p>
        <Link href="/signup" className="mt-8">
          <Button size="lg" className="text-lg px-8 bg-[#FC6200] hover:bg-[#FC6200]/90 text-white">
            Get Started — It&apos;s Free
          </Button>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="bg-[#003350] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <FadeIn delay={0}>
            <Card className="bg-[#00273B] border-[#00273B]/60 h-full">
              <CardHeader>
                <CardTitle className="text-[#FC6200]">Compare Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  See how your current processing rates stack up against industry
                  benchmarks and competing providers.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={150}>
            <Card className="bg-[#00273B] border-[#00273B]/60 h-full">
              <CardHeader>
                <CardTitle className="text-[#68DDDC]">See True Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Uncover hidden fees and understand the total cost of your
                  merchant processing — not just the headline rate.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={300}>
            <Card className="bg-[#00273B] border-[#00273B]/60 h-full">
              <CardHeader>
                <CardTitle className="text-[#FFA622]">Save Money</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Get a personalized savings estimate and actionable
                  recommendations to reduce your processing costs.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00273B] border-t border-[#003350] px-6 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Cresora Commerce. All rights reserved.
      </footer>
    </div>
  );
}
