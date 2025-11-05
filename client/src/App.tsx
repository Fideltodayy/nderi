import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import CheckOutDialog from "@/components/CheckOutDialog";
import ReturnDialog from "@/components/ReturnDialog";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import Students from "@/pages/Students";
import Transactions from "@/pages/Transactions";
import { LayoutDashboard, BookOpen, Users, History, Settings } from "lucide-react";
import SettingsPage from "@/pages/Settings";

interface RouterProps {
  onCheckOut: () => void;
  onReturn: () => void;
}

function Router({ onCheckOut, onReturn }: RouterProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/catalog", label: "Catalog", icon: BookOpen },
    { path: "/students", label: "Students", icon: Users },
    { path: "/transactions", label: "Transactions", icon: History },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar onCheckOut={onCheckOut} onReturn={onReturn} />
      
      <div className="border-b bg-background">
        <div className="flex gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 hover-elevate ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/students" component={Students} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/settings" component={SettingsPage} />
          <Route>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
              <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
              <Link href="/">
                <button className="text-primary hover:underline">Go to Dashboard</button>
              </Link>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router onCheckOut={() => setShowCheckOut(true)} onReturn={() => setShowReturn(true)} />
        <CheckOutDialog 
          open={showCheckOut} 
          onOpenChange={setShowCheckOut}
        />
        <ReturnDialog 
          open={showReturn} 
          onOpenChange={setShowReturn}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
