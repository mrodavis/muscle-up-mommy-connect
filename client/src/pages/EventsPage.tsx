import { MobileLayout } from "@/components/MobileLayout";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { Calendar as CalendarIcon, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";

export default function EventsPage() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hostId: user?.id || 0,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    // Convert string date back to date object for Zod if needed, or rely on schema transform
    const payload = {
      ...data,
      date: new Date(data.date), // Simple conversion
    };
    
    createEvent.mutate(payload as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  });

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Upcoming Events</h1>
            <p className="text-muted-foreground text-sm mt-1">Meetups & Stroller Walks</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full w-10 h-10 p-0">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Host an Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 mt-4">
                <Input placeholder="Event Title" {...form.register("title")} />
                <Textarea placeholder="Description" className="bg-background border-white/10" {...form.register("description")} />
                <Input type="date" {...form.register("date")} />
                <Input placeholder="Location" {...form.register("location")} />
                <Button className="w-full" isLoading={createEvent.isPending}>Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event.id} className="bg-card rounded-2xl p-5 border border-white/5 flex gap-4">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-xl shrink-0 border border-white/5">
                  <span className="text-xs text-primary font-bold uppercase">{format(new Date(event.date), "MMM")}</span>
                  <span className="text-xl font-bold text-white">{format(new Date(event.date), "d")}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{event.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{format(new Date(event.date), "h:mm a")}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Button size="sm" variant="ghost" className="h-8 px-3 text-xs">RSVP</Button>
                </div>
              </div>
            ))}

            {events?.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No upcoming events.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
