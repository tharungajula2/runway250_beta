"use client";

import Card from "@/components/Card";
import { CloudOff } from "lucide-react";

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <Card variant="pixel" className="p-8 max-w-sm border border-teal/20 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full animate-pulse">
            <CloudOff size={32} />
          </div>
        </div>
        
        <h1 className="text-lg font-black text-teal font-heading mb-3 uppercase tracking-wider">
          Connection Suspended
        </h1>
        
        <p className="text-sm font-medium text-text-primary mb-2 leading-relaxed">
          You&apos;re offline. Good.
        </p>
        
        <p className="text-xs text-text-muted leading-relaxed">
          Go live your life — your runway is saved.
        </p>
      </Card>
    </div>
  );
}
