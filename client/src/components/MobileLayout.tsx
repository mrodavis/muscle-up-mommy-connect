import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { Home, Users, Calendar, MapPin, ShoppingBag, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: MapPin, label: "Gyms", path: "/gyms" },
    { icon: Dumbbell, label: "Fitness", path: "/fitness" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-white/5">
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-50 safe-area-bottom">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link href={item.path} className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-white"
                )}>
                  <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
