import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="mb-8">
        <Logo className="scale-125" />
      </div>

      <Card className="w-full max-w-md border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first-name" className="text-sm font-medium leading-none text-gray-300">
                First Name
              </label>
              <Input id="first-name" placeholder="John" />
            </div>
             <div className="space-y-2">
              <label htmlFor="last-name" className="text-sm font-medium leading-none text-gray-300">
                Last Name
              </label>
              <Input id="last-name" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-gray-300">
              Email
            </label>
            <Input id="email" placeholder="name@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none text-gray-300">
              Password
            </label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-lg shadow-indigo-500/20 text-white">
            Sign Up
          </Button>
           <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          
           <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Google
            </Button>
            <Button variant="outline" className="w-full">
              Github
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="ml-1 font-medium text-indigo-400 hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
