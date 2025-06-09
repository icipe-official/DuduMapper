import React, { createContext, useContext, useState, ReactNode } from "react";

interface DrawerContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  overlaysOpen: boolean;
  setOverlaysOpen: (open: boolean) => void;
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: (groups: Record<string, boolean>) => void;
  downloadPopupOpen: boolean;
  setDownloadPopupOpen: (open: boolean) => void;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  handleOverlaysClick: () => void;
  handleGroupClick: (groupTitle: string) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  // States
  const [open, setOpen] = useState(true);
  const [overlaysOpen, setOverlaysOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);

  // Handlers
  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleOverlaysClick = () => setOverlaysOpen(!overlaysOpen);
  const handleGroupClick = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const value = {
    open,
    setOpen,
    overlaysOpen,
    setOverlaysOpen,
    expandedGroups,
    setExpandedGroups,
    downloadPopupOpen,
    setDownloadPopupOpen,
    handleDrawerOpen,
    handleDrawerClose,
    handleOverlaysClick,
    handleGroupClick,
  };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}
