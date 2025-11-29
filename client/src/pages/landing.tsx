import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, Building2, Film, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">P.R.I.S.M.</span>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Studio Booking & Scheduling
              <span className="text-primary block mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Professional Room & Studio Management System for film production studios, 
              editing rooms, sound recording facilities, and VFX departments.
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive booking management with real-time conflict detection, 
            repeat scheduling, and detailed reporting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate" data-testid="card-feature-calendar">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground">
                Visual monthly calendar with booking indicators. Click any date to view and manage bookings.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-scheduling">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Automatic time calculations, conflict detection, and repeat booking support.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-rooms">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Room Management</h3>
              <p className="text-muted-foreground">
                Manage studios, editing suites, sound rooms, and VFX workstations with ease.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-customers">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer & Projects</h3>
              <p className="text-muted-foreground">
                Track customers, projects, and editors with complete contact information.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-status">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Status Tracking</h3>
              <p className="text-muted-foreground">
                Tentative, Confirmed, Planning, Completed - track every booking status.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-conflict">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 flex items-center justify-center text-primary font-bold">!</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Conflict Detection</h3>
              <p className="text-muted-foreground">
                Prevent double bookings with smart conflict detection and optional override.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              <span className="font-semibold">P.R.I.S.M.</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional Room & Studio Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
