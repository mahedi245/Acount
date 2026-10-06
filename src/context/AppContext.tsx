'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';
import { translations } from '@/translations/dict';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['bn']) => string;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isCftModalOpen: boolean;
  openCftModal: () => void;
  closeCftModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCftModalOpen, setIsCftModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem('dtc_lang') as Language;
    if (savedLang === 'bn' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dtc_lang', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(newLang);
  };

  const t = (key: keyof typeof translations['bn']): string => {
    const dict = translations[language] || translations['bn'];
    return dict[key] || translations['en'][key] || String(key);
  };

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openCftModal = () => setIsCftModalOpen(true);
  const closeCftModal = () => setIsCftModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        toasts,
        showToast,
        removeToast,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isCftModalOpen,
        openCftModal,
        closeCftModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
