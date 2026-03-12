import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold">ROI Calculator</span>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Stop Overpaying for Merchant Processing
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Compare your current merchant processing costs against alternatives and
          discover how much you could save. Our ROI calculator gives you a clear,
          honest picture of your options.
        </p>
        <Link href="/signup" className="mt-8">
          <Button size="lg" className="text-lg px-8">
            Get Started — It&apos;s Free
          </Button>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="bg-muted/50 px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Compare Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See how your current processing rates stack up against industry
                benchmarks and competing providers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>See True Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Uncover hidden fees and understand the total cost of your
                merchant processing — not just the headline rate.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Save Money</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get a personalized savings estimate and actionable
                recommendations to reduce your processing costs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ROI Calculator. All rights reserved.
      </footer>
    </div>
  );
}
