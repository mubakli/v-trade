import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors border border-indigo-500/30">
        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
      </div>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        vTrade
      </span>
    </Link>
  );
}
