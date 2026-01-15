import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
        <AlertTriangle className="h-12 w-12 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-muted-foreground mb-8 text-lg">Page not found</p>
      
      <Link href="/">
        <Button size="lg" className="px-8">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
