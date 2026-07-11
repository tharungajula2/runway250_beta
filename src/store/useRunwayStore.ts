import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Quest {
  id: string;
  pillar: "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";
  tier: "Tiny" | "Standard" | "Hard";
  text: string;
  anchor: string;
  done: boolean;
}

interface RunwayState {
  darkMode: boolean;
  liveAI: boolean;
  currentDay: number; // default persona-day (250)
  sessionTimeLeft: number; // in seconds, default 600 (10 minutes)
  isSessionLocked: boolean;
  liveQuests: Record<number, Quest[]>; // Stores live-generated quests per day
  setDarkMode: (dark: boolean) => void;
  setLiveAI: (live: boolean) => void;
  setCurrentDay: (day: number) => void;
  setSessionTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSessionLocked: (locked: boolean) => void;
  setLiveQuestsForDay: (day: number, quests: Quest[]) => void;
  toggleLiveQuestDone: (day: number, questId: string) => void;
  resetSession: () => void;
}

export const useRunwayStore = create<RunwayState>()(
  persist(
    (set) => ({
      darkMode: false,
      liveAI: false, // Default is SIMULATED (OFF)
      currentDay: 250, // Default persona-day is 250
      sessionTimeLeft: 600,
      isSessionLocked: false,
      liveQuests: {},

      setDarkMode: (dark) => set({ darkMode: dark }),
      setLiveAI: (live) => set({ liveAI: live }),
      setCurrentDay: (day) => set({ currentDay: day }),
      setSessionTimeLeft: (time) =>
        set((state) => ({
          sessionTimeLeft: typeof time === "function" ? time(state.sessionTimeLeft) : time,
        })),
      setSessionLocked: (locked) => set({ isSessionLocked: locked }),

      setLiveQuestsForDay: (day, quests) =>
        set((state) => ({
          liveQuests: {
            ...state.liveQuests,
            [day]: quests,
          },
        })),

      toggleLiveQuestDone: (day, questId) =>
        set((state) => {
          const dayQuests = state.liveQuests[day] || [];
          const updatedQuests = dayQuests.map((q) =>
            q.id === questId ? { ...q, done: !q.done } : q
          );
          return {
            liveQuests: {
              ...state.liveQuests,
              [day]: updatedQuests,
            },
          };
        }),

      resetSession: () =>
        set({
          sessionTimeLeft: 600,
          isSessionLocked: false,
        }),
    }),
    {
      name: "runway-storage",
    }
  )
);
