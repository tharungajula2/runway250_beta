import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RunwayState {
  darkMode: boolean;
  liveAI: boolean;
  currentDay: number;
  sessionTimeLeft: number; // in seconds, default 600 (10 minutes)
  isSessionLocked: boolean;
  setDarkMode: (dark: boolean) => void;
  setLiveAI: (live: boolean) => void;
  setCurrentDay: (day: number) => void;
  setSessionTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSessionLocked: (locked: boolean) => void;
}

export const useRunwayStore = create<RunwayState>()(
  persist(
    (set) => ({
      darkMode: false,
      liveAI: false, // Default is SIMULATED per recommendations
      currentDay: 1,
      sessionTimeLeft: 600,
      isSessionLocked: false,
      setDarkMode: (dark) => set({ darkMode: dark }),
      setLiveAI: (live) => set({ liveAI: live }),
      setCurrentDay: (day) => set({ currentDay: day }),
      setSessionTimeLeft: (time) =>
        set((state) => ({
          sessionTimeLeft: typeof time === "function" ? time(state.sessionTimeLeft) : time,
        })),
      setSessionLocked: (locked) => set({ isSessionLocked: locked }),
    }),
    {
      name: "runway250-storage",
    }
  )
);
