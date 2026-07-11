import React from "react";
import { motion } from "framer-motion";

interface CardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  variant?: "default" | "surface" | "pixel";
}

export default function Card({ children, variant = "default", className = "", ...props }: CardProps) {
  const baseStyle = "p-5 rounded-2xl transition-all duration-200";
  
  const variants = {
    default: "bg-white dark:bg-dark-surface border border-[var(--border-color)] shadow-xs",
    surface: "bg-paper dark:bg-dark-bg border border-[var(--border-color)]",
    pixel: "bg-teal/5 border-2 border-teal rounded-none shadow-[4px_4px_0px_0px_rgba(42,127,127,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(42,127,127,0.3)]",
  };

  return (
    <motion.div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </motion.div>
  );
}
