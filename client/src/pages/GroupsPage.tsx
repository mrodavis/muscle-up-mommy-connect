import { MobileLayout } from "@/components/MobileLayout";
import { useGroups } from "@/hooks/use-groups";
import { Users, Lock, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function GroupsPage() {
  const { data: groups, isLoading } = useGroups();

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Support Groups</h1>
          <p className="text-muted-foreground text-sm mt-1">Find your tribe.</p>
        </header>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {groups?.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`} className="block">
                <div className="bg-card hover:bg-white/5 transition-colors p-4 rounded-2xl border border-white/5 flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">{group.name}</h3>
                      {group.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/70">
                        {group.tierRequired === 'free' ? 'Public' : group.tierRequired?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
