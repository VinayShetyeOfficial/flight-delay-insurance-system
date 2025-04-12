
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeMode, SettingsContextType } from '../types';
import { useToast } from "@/hooks/use-toast";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    return savedTheme || 'system';
  });
  
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const savedPref = localStorage.getItem('notificationsEnabled');
    return savedPref !== null ? JSON.parse(savedPref) : true;
  });
  
  const [messageSoundEnabled, setMessageSoundEnabledState] = useState<boolean>(() => {
    const savedPref = localStorage.getItem('messageSoundEnabled');
    return savedPref !== null ? JSON.parse(savedPref) : true;
  });
  
  const { toast } = useToast();

  // Apply theme
  useEffect(() => {
    const applyTheme = (newTheme: ThemeMode) => {
      const htmlEl = document.documentElement;
      
      if (newTheme === 'system') {
        const systemTheme = getSystemTheme();
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(systemTheme);
      } else {
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(newTheme);
      }
    };
    
    applyTheme(theme);
    
    // Listen for system theme changes if using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: "Theme updated",
      description: `Theme set to ${newTheme === 'system' ? 'system preference' : newTheme}`,
    });
  };
  
  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
    
    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled ? "You will now receive notifications" : "You will no longer receive notifications",
    });
  };
  
  const setMessageSoundEnabled = (enabled: boolean) => {
    setMessageSoundEnabledState(enabled);
    localStorage.setItem('messageSoundEnabled', JSON.stringify(enabled));
    
    toast({
      title: enabled ? "Message sounds enabled" : "Message sounds disabled",
      description: enabled ? "You will now hear sounds when receiving messages" : "Message sounds have been muted",
    });
  };

  const value = {
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    messageSoundEnabled,
    setMessageSoundEnabled,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
