import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Quest {
  id: string;
  pillar: "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";
  tier: "Tiny" | "Standard" | "Hard";
  text: string;
  anchor: string;
  done: boolean;
  isHunt?: boolean;
  description?: string;
}

interface RunwayState {
  darkMode: boolean;
  liveAI: boolean;
  currentDay: number; // default persona-day (250)
  sessionTimeLeft: number; // in seconds, default 600 (10 minutes)
  isSessionLocked: boolean;
  liveQuests: Record<number, Quest[]>; // Stores live-generated quests per day
  selectedPillars: string[]; // User chosen focus pillars
  mode: "game" | "pitch";
  soundEnabled: boolean;
  solvedRiddles: Record<number, boolean>;
  solveRiddle: (day: number) => void;
  setMode: (mode: "game" | "pitch") => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setLiveAI: (live: boolean) => void;
  setCurrentDay: (day: number) => void;
  setSessionTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSessionLocked: (locked: boolean) => void;
  setLiveQuestsForDay: (day: number, quests: Quest[]) => void;
  toggleLiveQuestDone: (day: number, questId: string) => void;
  updateQuestDescription: (day: number, questId: string, desc: string) => void;
  setSelectedPillars: (pillars: string[]) => void;
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
      mode: "game", // Default is Game Mode
      soundEnabled: true, // Default to true
      selectedPillars: ["Body", "Mind", "Craft", "Voice", "Order", "Bonds"], // default all
      solvedRiddles: {},

      setMode: (mode) => set({ mode }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setDarkMode: (dark) => set({ darkMode: dark }),
      setLiveAI: (live) => set({ liveAI: live }),
      setCurrentDay: (day) => set({ currentDay: day }),
      setSessionTimeLeft: (time) =>
        set((state) => ({
          sessionTimeLeft: typeof time === "function" ? time(state.sessionTimeLeft) : time,
        })),
      setSessionLocked: (locked) => set({ isSessionLocked: locked }),
      solveRiddle: (day) =>
        set((state) => ({
          solvedRiddles: {
            ...state.solvedRiddles,
            [day]: true,
          },
        })),

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

      updateQuestDescription: (day, questId, desc) =>
        set((state) => {
          const dayQuests = state.liveQuests[day] || [];
          const updatedQuests = dayQuests.map((q) =>
            q.id === questId ? { ...q, description: desc } : q
          );
          return {
            liveQuests: {
              ...state.liveQuests,
              [day]: updatedQuests,
            },
          };
        }),

      setSelectedPillars: (pillars) => set({ selectedPillars: pillars }),

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
