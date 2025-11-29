import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Moon,
  Sun,
  Database,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    cancellationAlerts: true,
    dailySummary: false,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
    
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    setDbStatus("checking");
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        setDbStatus("connected");
      } else {
        setDbStatus("error");
      }
    } catch {
      setDbStatus("error");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast({
      title: "Settings Saved",
      description: "Notification preferences updated",
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6" data-testid="settings-page">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  data-testid="switch-dark-mode"
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Connection
              </CardTitle>
              <CardDescription>
                Check database connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Status</Label>
                  <p className="text-sm text-muted-foreground">
                    PostgreSQL database connection
                  </p>
                </div>
                {dbStatus === "checking" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking...
                  </Badge>
                )}
                {dbStatus === "connected" && (
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                )}
                {dbStatus === "error" && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Error
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkDatabaseConnection}
                data-testid="button-test-connection"
              >
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role Management
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Current Role</Label>
                  <p className="text-sm text-muted-foreground">
                    Your access level in the system
                  </p>
                </div>
                <Badge variant="default">Admin</Badge>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Available roles:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Admin:</strong> Full access to all features</li>
                  <li><strong>User:</strong> Can create and manage bookings</li>
                  <li><strong>Viewer:</strong> Read-only access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="booking-reminders">Booking Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming bookings
                  </p>
                </div>
                <Switch
                  id="booking-reminders"
                  checked={notifications.bookingReminders}
                  onCheckedChange={() => handleNotificationChange("bookingReminders")}
                  data-testid="switch-booking-reminders"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cancellation-alerts">Cancellation Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when bookings are cancelled
                  </p>
                </div>
                <Switch
                  id="cancellation-alerts"
                  checked={notifications.cancellationAlerts}
                  onCheckedChange={() => handleNotificationChange("cancellationAlerts")}
                  data-testid="switch-cancellation-alerts"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-summary">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily booking summary email
                  </p>
                </div>
                <Switch
                  id="daily-summary"
                  checked={notifications.dailySummary}
                  onCheckedChange={() => handleNotificationChange("dailySummary")}
                  data-testid="switch-daily-summary"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
