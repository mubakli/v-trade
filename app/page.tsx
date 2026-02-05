import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-10">
      {/* Hero Section */}
      <section className="container px-4 mx-auto md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Master the Markets <br /> Without the Risk
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-[600px]">
              Experience real-time virtual trading with advanced analytics and AI-powered insights. Join thousands of traders sharpening their skills today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto font-semibold text-lg px-8">
                  Start Trading Now
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold text-lg px-8">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl">
               {/* Decorative Abstract Chart UI */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                    <div className="h-4 w-16 bg-green-500/20 text-green-500 text-xs flex items-center justify-center rounded font-mono">+2.4%</div>
                  </div>
                  <div className="h-48 w-full bg-gradient-to-t from-indigo-500/20 to-transparent rounded-lg relative overflow-hidden">
                    <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="none">
                       <path d="M0,100 C150,50 300,150 450,20 L600,100" stroke="rgba(99,102,241,0.5)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                     <div className="h-20 rounded bg-white/5"></div>
                     <div className="h-20 rounded bg-white/5"></div>
                     <div className="h-20 rounded bg-white/5"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 mx-auto md:px-6">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose vTrade?</h2>
           <p className="text-gray-400">Everything you need to become a professional trader.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="hover:bg-white/5 transition-colors duration-300">
             <CardContent className="pt-6">
               <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               </div>
               <h3 className="text-xl font-bold mb-2">Real-Time Data</h3>
               <p className="text-gray-400">Practice with real-time market data to simulate actual trading conditions accurately.</p>
             </CardContent>
           </Card>
           
           <Card className="hover:bg-white/5 transition-colors duration-300">
             <CardContent className="pt-6">
               <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
               </div>
               <h3 className="text-xl font-bold mb-2">AI Insights</h3>
               <p className="text-gray-400">Get personalized trading tips and performance analysis powered by advanced AI.</p>
             </CardContent>
           </Card>
           
           <Card className="hover:bg-white/5 transition-colors duration-300">
             <CardContent className="pt-6">
               <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               </div>
               <h3 className="text-xl font-bold mb-2">Risk Free</h3>
               <p className="text-gray-400">Test new strategies and learn from mistakes without losing a single penny of real money.</p>
             </CardContent>
           </Card>
        </div>
      </section>
    </div>
  );
}
