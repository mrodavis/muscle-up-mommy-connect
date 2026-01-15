import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/AuthPage";
import FeedPage from "@/pages/FeedPage";
import GroupsPage from "@/pages/GroupsPage";
import EventsPage from "@/pages/EventsPage";
import GymsPage from "@/pages/GymsPage";
import FitnessPage from "@/pages/FitnessPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth">
        {user ? <Redirect to="/feed" /> : <AuthPage />}
      </Route>
      
      <Route path="/feed">
        <ProtectedRoute component={FeedPage} />
      </Route>
      
      <Route path="/groups">
        <ProtectedRoute component={GroupsPage} />
      </Route>
      
      <Route path="/events">
        <ProtectedRoute component={EventsPage} />
      </Route>
      
      <Route path="/gyms">
        <ProtectedRoute component={GymsPage} />
      </Route>
      
      <Route path="/fitness">
        <ProtectedRoute component={FitnessPage} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>

      <Route path="/">
        {user ? <Redirect to="/feed" /> : <Redirect to="/auth" />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
