import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          
          variant === "primary" && 
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.6)] hover:brightness-110",
          
          variant === "secondary" && 
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          
          variant === "outline" && 
          "border border-white/20 bg-transparent hover:bg-white/5 hover:text-white text-white/90",
          
          variant === "ghost" && 
          "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white",
          
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
