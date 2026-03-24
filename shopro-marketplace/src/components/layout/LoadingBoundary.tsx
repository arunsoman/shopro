import React from 'react';
import { useGlobalLoading } from '@/context/LoadingContext';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingBoundaryProps {
  children: React.ReactNode;
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({ children }) => {
  const { isLoading } = useGlobalLoading();

  return (
    <div className="relative w-full h-full">
      {/* Dynamic Top Progress Bar - Non-obstructive global feedback */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-emerald-500 to-indigo-500 z-100 origin-left shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        )}
      </AnimatePresence>

      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
