import React, { useState, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";

type ScreenKey = "home" | "journal" | "journal-sidebar" | "calendar" | "check-in" | "escalate";

interface Coordinate {
  x: number;
  y: number;
}

const SCREENS: Record<ScreenKey, Coordinate> = {
  "calendar": { x: -1, y: 0 },
  "home": { x: 0, y: 0 },
  "journal": { x: 1, y: 0 },
  "journal-sidebar": { x: 2, y: 0 },
  "check-in": { x: 0, y: 1 }, // Above Home
  "escalate": { x: 0, y: -1 }, // Below Home
};

const COORDINATE_TO_SCREEN: Record<string, ScreenKey> = Object.entries(SCREENS).reduce(
  (acc, [key, coord]) => ({ ...acc, [`${coord.x},${coord.y}`]: key as ScreenKey }),
  {}
);

export function SwipeContainer({
  homeScreen,
  journalScreen,
  journalSidebar,
  calendarScreen,
  checkInScreen,
  escalateScreen,
}: {
  homeScreen: React.ReactNode;
  journalScreen: React.ReactNode;
  journalSidebar: React.ReactNode;
  calendarScreen: React.ReactNode;
  checkInScreen: React.ReactNode;
  escalateScreen: React.ReactNode;
}) {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("home");
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50; // minimum drag distance
    const { offset, velocity } = info;
    const currentCoord = SCREENS[activeScreen];

    let newX = currentCoord.x;
    let newY = currentCoord.y;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x < -threshold) {
        newX += 1; // Swiped left -> move view right
      } else if (offset.x > threshold) {
        newX -= 1; // Swiped right -> move view left
      }
    } else {
      // Vertical swipe
      if (offset.y > threshold) {
        newY += 1; // Swiped down -> move view up (to check-in)
      } else if (offset.y < -threshold) {
        newY -= 1; // Swiped up -> move view down (to escalate)
      }
    }

    const newScreen = COORDINATE_TO_SCREEN[`${newX},${newY}`];
    if (newScreen) {
      setActiveScreen(newScreen);
    }
  };

  const activeCoord = SCREENS[activeScreen];

  if (!windowSize.width) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background touch-none">
      <motion.div
        className="w-full h-full relative"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{
          x: -activeCoord.x * windowSize.width,
          y: activeCoord.y * windowSize.height, // Note: standard screen Y goes down, but math uses visual intuition. if activeCoord.y = 1 (check-in above), we want y = windowHeight to push home down
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Render all screens in absolute positions relative to this container */}
        <div className="absolute w-screen h-screen" style={{ left: 0, top: 0 }}>
          {homeScreen}
        </div>
        <div className="absolute w-screen h-screen" style={{ left: "-100vw", top: 0 }}>
          {calendarScreen}
        </div>
        <div className="absolute w-screen h-screen" style={{ left: "100vw", top: 0 }}>
          {journalScreen}
        </div>
        <div className="absolute w-screen h-screen" style={{ left: "200vw", top: 0 }}>
          {journalSidebar}
        </div>
        <div className="absolute w-screen h-screen" style={{ left: 0, top: "-100vh" }}>
          {checkInScreen}
        </div>
        <div className="absolute w-screen h-screen" style={{ left: 0, top: "100vh" }}>
          {escalateScreen}
        </div>
      </motion.div>
    </div>
  );
}
