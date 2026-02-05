"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto md:px-6 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className="text-muted-foreground hover:text-foreground p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container px-4 py-4 space-y-4">
            <Link 
              href="/dashboard" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/features" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
