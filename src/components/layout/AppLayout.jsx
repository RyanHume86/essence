import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TopHeader from "./TopHeader";
import BottomNav from "./BottomNav";

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const pageTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1],
};

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopHeader />

      {/* Safe-area top spacer + header height */}
      <div
        className="flex-shrink-0"
        style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
      />

      <main className="flex-1 overflow-y-auto pb-nav">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}