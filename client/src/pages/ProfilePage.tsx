import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/Button";
import { Crown, Settings, LogOut, MapPin, Calendar, Award } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <header className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => logout.mutate()}>
            <LogOut className="w-4 h-4 text-destructive" />
          </Button>
        </header>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-3xl p-6 border border-white/5 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Crown className="w-32 h-32 rotate-12" />
          </div>

          <div className="w-24 h-24 mx-auto bg-secondary rounded-full border-4 border-card shadow-lg mb-4 flex items-center justify-center text-3xl font-bold text-muted-foreground relative z-10">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.displayName[0]
            )}
            {user.tier !== 'free' && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-card">
                <Crown className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-white relative z-10">{user.displayName}</h2>
          <p className="text-primary text-sm font-medium mb-1">@{user.username}</p>
          <p className="text-muted-foreground text-xs mb-4">{user.bio || "No bio yet"}</p>

          <div className="flex justify-center gap-2 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/5 text-xs border border-white/5">
              {user.stage || "Member"}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20 capitalize">
              {user.tier} Tier
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium">Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">85%</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Events</span>
            </div>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
          {[
            { label: "Account Settings", icon: Settings },
            { label: "Location", icon: MapPin },
            { label: "Subscription", icon: Crown },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="text-muted-foreground">›</div>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
