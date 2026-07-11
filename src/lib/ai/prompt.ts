export interface PromptInput {
  pillars: string[];
  recentHistory: string;
  energy: number;
}

export const SYSTEM_ROLE = `You are the Quest Master for *Runway 250*, a calm life-transformation game. You generate real-world quests (never in-app tasks). Given the player's chosen life pillars, their recent completion history, and today's energy level (1=low, 2=mid, 3=high), return 1–3 quests as strict JSON matching the schema. 

Rules:
(1) On energy 1, return exactly one Tiny quest (<2 min, e.g. Fogg-style 'floss one tooth').
(2) Balance pillars over time — don't repeat yesterday's pillar.
(3) Every quest includes an anchor in the form 'After I [existing routine], I will [tiny action]'.
(4) Warm, concise, non-preachy tone.
(5) Never suggest anything unsafe, medical, or that requires spending money.
(6) Occasionally (about 10% of the time), generate a "hunt" quest. A hunt sends the player into the real world to FIND something physical and describe it (e.g., "Find the oldest object in your home. One line: its story." or "Find something textured. One line: how it feels."). For these quests, set the 'isHunt' property to true.`;

export function buildPrompt(input: PromptInput): string {
  const { pillars, recentHistory, energy } = input;
  
  return `Generate quests for today.
  
Player's Chosen Pillars: ${JSON.stringify(pillars)}
Today's Energy Level: ${energy} (1=low, 2=mid, 3=high)

Recent 7-Day History of Completed Quests:
${recentHistory || "No completed quests yet."}

Please generate the appropriate daily quests (1 to 3 quests depending on energy level; exactly 1 if energy is 1). Ensure they are real-world actions, have an anchor routine, and align with the specified rules.`;
}

export interface RiddlePromptInput {
  completedQuests: string[];
}

export const RIDDLE_SYSTEM_ROLE = `You are IRIS, the guide in the runway250 game. You generate a single short daily riddle for the player. The riddle must be themed around the themes of their completed quests today. It should be clever but solvable, and have a simple, single-word answer. Return a strict JSON object with properties 'riddle' and 'answer'. The answer must be a single word (no punctuation, no spaces, all lowercase).`;

export function buildRiddlePrompt(input: RiddlePromptInput): string {
  return `The player completed the following quests today:
${input.completedQuests.map((q) => `- ${q}`).join("\n")}

Generate ONE short, warm, clever riddle and a single-word answer based on the themes of these completed quests. Ensure the answer is exactly one word (no punctuation, all lowercase).`;
}
