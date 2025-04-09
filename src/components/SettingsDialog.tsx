
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX,
  User, 
  Shield,
  Palette,
  LogOut
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { ThemeMode } from "@/types";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { 
    theme, 
    setTheme, 
    notificationsEnabled, 
    setNotificationsEnabled,
    messageSoundEnabled,
    setMessageSoundEnabled
  } = useSettings();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance");

  const handleLogout = () => {
    logout();
    onClose();
  };

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-5 w-5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
    { value: "system", label: "System", icon: <Monitor className="h-5 w-5" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Customize your Echo Chat experience
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center gap-2 h-24 ${
                      theme === option.value 
                        ? "bg-chat-primary hover:bg-chat-primary/90" 
                        : "hover:bg-muted/20"
                    }`}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-base">
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="messageSounds" className="text-base">
                    Message Sounds
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds when receiving messages
                  </p>
                </div>
                <Switch
                  id="messageSounds"
                  checked={messageSoundEnabled}
                  onCheckedChange={setMessageSoundEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                  <UserAvatar user={user} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-medium">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                  </h3>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
