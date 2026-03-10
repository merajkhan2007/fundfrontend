import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Wallet, LineChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[90vh]">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-primary/5 border-b">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-8 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">
            MAQASIDFund
          </h1>
          <p className="text-xl text-muted-foreground md:px-20">
            A secure and modern platform to manage MAQASIDFund pools. Members can deposit monthly contributions and easily request low-interest loans from the collective fund.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base">
              <Link href="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/login">Member Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/30 rounded-2xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Monthly Tracking</h3>
              <p className="text-muted-foreground">Automatically track your monthly contributions, outstanding balance, and your lifetime deposits.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/30 rounded-2xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Transparent Loans</h3>
              <p className="text-muted-foreground">Request, approve, and track MAQASIDFund loans. Automated EMI calculations and fair interest distributions.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/30 rounded-2xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Financial Insights</h3>
              <p className="text-muted-foreground">Admins have access to powerful dashboards showing fund metrics, expected collections, and member growth.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
