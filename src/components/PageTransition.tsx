"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: shouldReduce ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }
    }
  } as any;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className="w-full h-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
