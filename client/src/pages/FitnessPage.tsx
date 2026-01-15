import { MobileLayout } from "@/components/MobileLayout";
import { useFitnessPrograms } from "@/hooks/use-fitness";
import { PlayCircle, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/Button";

export default function FitnessPage() {
  const { data: programs, isLoading } = useFitnessPrograms();

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Fitness Reboot</h1>
          <p className="text-muted-foreground text-sm mt-1">Postpartum recovery & strength.</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-card animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {programs?.map((program) => (
              <div key={program.id} className="bg-card rounded-3xl overflow-hidden border border-white/5 shadow-lg group">
                <div className="relative h-48 bg-secondary">
                  {program.thumbnailUrl ? (
                    <img src={program.thumbnailUrl} alt={program.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
                      <PlayCircle className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                        {program.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{program.title}</h3>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-white/70 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{program.durationWeeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      <span>Certified Coach</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">Start Program</Button>
                </div>
              </div>
            ))}

            {programs?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">New programs coming soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
