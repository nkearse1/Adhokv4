import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 text-[#2E3A8C] font-bold text-2xl">⨁</div>
            <div>
            </div>
          </div>
        </header>

        {/* Mobile-responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2F2F2F]">I'm a Client</h2>
              <Link to="/upload">
                <Button className="w-full bg-[#2E3A8C] hover:bg-[#2E3A8C]/90 text-white">
                  Create a Project Brief
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2F2F2F]">I'm a Professional</h2>
              <div className="space-y-4">
                <Link to="/SignIn">
                  <Button className="w-full bg-[#00A499] hover:bg-[#00A499]/90 text-white">
                    Find Projects
                  </Button>
                </Link>
                <Link to="/talent/SignUp">
                  <Button
                    variant="outline"
                    className="w-full border-[#2E3A8C] text-[#2E3A8C] hover:bg-[#2E3A8C]/10"
                  >
                    Sign Up as Talent
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  );
}