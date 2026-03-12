import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold">ROI Calculator</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="ghost" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          Welcome{session.user.name ? `, ${session.user.name}` : ""}!
        </h1>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ROI Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The ROI Calculator is coming soon. You&apos;ll be able to compare
              merchant processing options and see exactly how much you could save.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
