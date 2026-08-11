import React, { useState, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";

export type ScreenKey = "home" | "journal" | "journal-sidebar" | "calendar";

const ORDER: ScreenKey[] = ["calendar", "home", "journal", "journal-sidebar"];

export function SwipeContainer({
  activeScreen,
  onScreenChange,
  homeScreen,
  journalScreen,
  journalSidebar,
  calendarScreen,
}: {
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
  homeScreen: React.ReactNode;
  journalScreen: React.ReactNode;
  journalSidebar: React.ReactNode;
  calendarScreen: React.ReactNode;
}) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const getWidth = () => window.visualViewport?.width ?? window.innerWidth;
    const handleResize = () => setWindowWidth(getWidth());

    handleResize();
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    const currentIndex = ORDER.indexOf(activeScreen);
    let newIndex = currentIndex;

    if (info.offset.x < -threshold) {
      newIndex = Math.min(currentIndex + 1, ORDER.length - 1);
    } else if (info.offset.x > threshold) {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      onScreenChange(ORDER[newIndex]);
    }
  };

  const activeIndex = ORDER.indexOf(activeScreen);

  if (!windowWidth) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background select-none">
      <motion.div
        className="h-full relative"
        style={{ width: windowWidth * ORDER.length }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: -activeIndex * windowWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Render all screens side by side; horizontal swipe/drag is the only
            gesture handled here so it never fights a screen's own vertical
            scroll content. */}
        <div className="absolute h-full" style={{ left: 0, top: 0, width: windowWidth }}>
          {calendarScreen}
        </div>
        <div className="absolute h-full" style={{ left: windowWidth, top: 0, width: windowWidth }}>
          {homeScreen}
        </div>
        <div className="absolute h-full" style={{ left: windowWidth * 2, top: 0, width: windowWidth }}>
          {journalScreen}
        </div>
        <div className="absolute h-full" style={{ left: windowWidth * 3, top: 0, width: windowWidth }}>
          {journalSidebar}
        </div>
      </motion.div>
    </div>
  );
}
