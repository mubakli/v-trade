import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)}>
      {/* Icon: Abstract Geometric V / Chart in Primary Orange */}
      <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19H5.5L12 6.5Z" fill="currentColor"/>
          <path d="M12 12V16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      
      <div className="flex flex-col">
        <span className="text-xl font-black uppercase tracking-tighter leading-none text-foreground group-hover:text-primary transition-colors font-mono">
          vTRADE
        </span>
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary leading-none">
          PROTOCOL
        </span>
      </div>
    </Link>
  );
}
