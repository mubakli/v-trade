"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/wallet');
        if (response.ok) {
          const data = await response.json();
          if (data.wallet && data.user) {
            setUser({ name: data.user.name });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-none">
      <div className="container px-4 mx-auto md:px-6 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/features" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 border-2 border-border hover:border-foreground transition-colors bg-secondary"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{user.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border-2 border-border shadow-lg animate-in slide-in-from-top-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors border-l-2 border-transparent hover:border-primary"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground uppercase font-bold tracking-wider text-xs">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="uppercase font-bold tracking-wider text-xs border-2 border-transparent hover:border-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className="text-muted-foreground hover:text-foreground p-2 border-2 border-transparent hover:border-border transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b-2 border-border bg-background animate-in slide-in-from-top-5">
          <div className="container px-4 py-4 space-y-2">
            <Link 
              href="/dashboard" 
              className="block text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary p-3 transition-colors border-l-2 border-transparent hover:border-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/features" 
              className="block text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary p-3 transition-colors border-l-2 border-transparent hover:border-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="block text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary p-3 transition-colors border-l-2 border-transparent hover:border-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="block text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary p-3 transition-colors border-l-2 border-transparent hover:border-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            
            <div className="pt-4 mt-4 border-t-2 border-border flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-3 py-2 bg-secondary border-l-2 border-primary">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <User className="w-4 h-4" />
                      {user.name}
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground uppercase font-bold tracking-wider hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center text-muted-foreground uppercase font-bold tracking-wider">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full uppercase font-bold tracking-wider rounded-none">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
