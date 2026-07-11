import * as fs from "fs";
import * as path from "path";
import {
  calculateDailyXP,
  calculateResolutionPct,
  Tier,
} from "../game/formulas";

type Pillar = "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";

interface Quest {
  id: string;
  pillar: Pillar;
  tier: Tier;
  text: string;
  anchor: string;
  done: boolean;
}

interface DayRecord {
  day: number;
  act: "Boot" | "Rendering" | "Sharpening" | "HighDef";
  energy: 1 | 2 | 3;
  quests: Quest[];
  reflection: string;
  streak: number;
  freezeUsed: boolean;
  xpGained: number;
  cumulativeXP: number;
  resolutionPct: number;
  milestone?: string;
}

interface Journey {
  persona: string;
  days: DayRecord[];
}

// ---------------------------------------------------------
// DETERMINISTIC SEEDED RANDOM (LCG)
// ---------------------------------------------------------
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  range(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// ---------------------------------------------------------
// POOL DEFINITIONS (Quests & Reflections)
// ---------------------------------------------------------
const PILLARS: Pillar[] = ["Body", "Mind", "Craft", "Voice", "Order", "Bonds"];

const QUESTS_POOL: Record<Pillar, Record<Tier, { text: string; anchor: string }[]>> = {
  Body: {
    Tiny: [
      { text: "Stretch your arms overhead for 30 seconds", anchor: "After I get out of bed" },
      { text: "Do 5 deep breaths standing up", anchor: "After I drink a glass of water" },
      { text: "Do 5 gentle neck rolls", anchor: "After I sit down at my desk" },
      { text: "Do 5 calf raises while brushing teeth", anchor: "After I pick up my toothbrush" }
    ],
    Standard: [
      { text: "Walk around the block for 10 minutes", anchor: "After I close my laptop for lunch" },
      { text: "Do a 5-minute stretching routine", anchor: "After I finish my afternoon standup" },
      { text: "Do 15 squats in the kitchen", anchor: "After I put the kettle on" },
      { text: "Walk up and down the stairs three times", anchor: "After I return from checking the mail" }
    ],
    Hard: [
      { text: "Go for a brisk 30-minute run", anchor: "After I log off my computer for the day" },
      { text: "Do a 20-minute core workout", anchor: "After I lay out my yoga mat" },
      { text: "Complete 3 sets of pushups to failure", anchor: "After I shut down my dev environment" },
      { text: "Walk 10,000 steps today", anchor: "After I put on my running shoes" }
    ]
  },
  Mind: {
    Tiny: [
      { text: "Read exactly one paragraph of a book", anchor: "After I sit down with my morning tea" },
      { text: "Write down one single word describing today's mood", anchor: "After I open my journal" },
      { text: "Sit in silence for 60 seconds", anchor: "After I close my bedroom door" },
      { text: "List one thing you are grateful for", anchor: "After I unlock my phone in the morning" }
    ],
    Standard: [
      { text: "Read 5 pages of a non-fiction book", anchor: "After I finish eating dinner" },
      { text: "Write three bullet points about your goals", anchor: "After I drink my afternoon tea" },
      { text: "Do a 5-minute guided mindfulness session", anchor: "After I plug in my phone to charge" },
      { text: "Spend 10 minutes sketching or doodling", anchor: "After I wash my breakfast dishes" }
    ],
    Hard: [
      { text: "Read a full chapter and take notes", anchor: "After I shut off all screens at night" },
      { text: "Write a 300-word stream-of-consciousness entry", anchor: "After I wake up and stretch" },
      { text: "Complete a 15-minute meditation in silence", anchor: "After I set my evening alarm" },
      { text: "Listen to an educational lecture for 20 minutes", anchor: "After I start my evening walk" }
    ]
  },
  Craft: {
    Tiny: [
      { text: "Write one single line of code", anchor: "After I open my IDE" },
      { text: "Read one documentation API reference page", anchor: "After I open my web browser" },
      { text: "Check your open pull requests", anchor: "After I log in to GitHub" },
      { text: "Organize one folder on your desktop", anchor: "After I boot up my computer" }
    ],
    Standard: [
      { text: "Write a unit test for an existing function", anchor: "After I start my IDE" },
      { text: "Refactor a small helper function", anchor: "After I finish my morning standup" },
      { text: "Fix one minor UI bug in your project", anchor: "After I open my issue tracker" },
      { text: "Read a technical blog post for 10 minutes", anchor: "After I sit at my coding desk" }
    ],
    Hard: [
      { text: "Implement a complete new feature block", anchor: "After I finish my first cup of coffee" },
      { text: "Write the README documentation for a project", anchor: "After I merge my main branch" },
      { text: "Solve a complex algorithmic puzzle", anchor: "After I review my daily tasks" },
      { text: "Spend 45 minutes coding without distraction", anchor: "After I put on my noise-canceling headphones" }
    ]
  },
  Voice: {
    Tiny: [
      { text: "Send a quick hello text to a friend", anchor: "After I open WhatsApp in the morning" },
      { text: "Leave a nice comment on someone's update", anchor: "After I open my LinkedIn feed" },
      { text: "Draft a one-sentence message to a peer", anchor: "After I sit down for lunch" },
      { text: "Smile and greet a neighbor or cashier", anchor: "After I walk out the front door" }
    ],
    Standard: [
      { text: "Write a short post sharing what you are building", anchor: "After I push code to GitHub" },
      { text: "Send an honest message expressing gratitude to a peer", anchor: "After I close my email client" },
      { text: "Ask a colleague for feedback on a minor issue", anchor: "After I check my daily schedule" },
      { text: "Reach out to someone you haven't spoken to in months", anchor: "After I open my contacts list" }
    ],
    Hard: [
      { text: "Publish an article or detailed update in public", anchor: "After I finish my weekly sprint" },
      { text: "Send a long, sincere message addressing an avoidance", anchor: "After I finish my evening reflection" },
      { text: "Record a 2-minute video update of your work progress", anchor: "After I clean up my desk for the day" },
      { text: "Have a deep conversation with a mentor", anchor: "After I schedule a slot on my calendar" }
    ]
  },
  Order: {
    Tiny: [
      { text: "Clear one surface (e.g. keyboard tray)", anchor: "After I finish working for the day" },
      { text: "Put one stray item back in its spot", anchor: "After I stand up from my desk" },
      { text: "Take one piece of trash to the bin", anchor: "After I finish eating a snack" },
      { text: "Wipe down your phone screen", anchor: "After I wash my hands" }
    ],
    Standard: [
      { text: "File 10 unorganized files in local storage", anchor: "After I open my downloads folder" },
      { text: "Wash and dry all coffee mugs in the sink", anchor: "After I finish my morning beverage" },
      { text: "Organize your desk drawer or tray", anchor: "After I finish my lunch hour" },
      { text: "Empty your physical and digital trash cans", anchor: "After I shut down my computer" }
    ],
    Hard: [
      { text: "Deep clean your entire workspace desk area", anchor: "After I log off on Friday evening" },
      { text: "Organize your wardrobe or closet layout", anchor: "After I fold my laundry" },
      { text: "Clean and reset the kitchen counters completely", anchor: "After I finish cooking dinner" },
      { text: "Declutter your email inbox to zero unread", anchor: "After I drink my morning coffee" }
    ]
  },
  Bonds: {
    Tiny: [
      { text: "Send a heart emoji to a family member", anchor: "After I check my phone notifications" },
      { text: "Hug a loved one or pet for 5 seconds", anchor: "After I walk into the living room" },
      { text: "Share a fun link or meme with a close friend", anchor: "After I finish my lunch break" },
      { text: "Wish someone a good day with sincerity", anchor: "After I wake up" }
    ],
    Standard: [
      { text: "Call a family member for a 5-minute check-in", anchor: "After I sit down after work" },
      { text: "Help a loved one with a small household chore", anchor: "After I finish my dinner" },
      { text: "Write a supportive message to a friend", anchor: "After I check my calendar" },
      { text: "Plan a meetup or call with a friend for later", anchor: "After I finish my afternoon standup" }
    ],
    Hard: [
      { text: "Have a 30-minute undistracted call with a friend", anchor: "After I log off my computer" },
      { text: "Prepare a meal for your family or a loved one", anchor: "After I close my afternoon meetings" },
      { text: "Spend an hour of quality offline time with family", anchor: "After I turn off the living room television" },
      { text: "Write a letter or long email updating a dear friend", anchor: "After I finish my Sunday morning tea" }
    ]
  }
};

const REFLECTIONS_POOL: string[] = [
  "Didn't want to. Did the tiny version anyway. Weird how that's enough some days.",
  "Simple, fast, done. Building momentum feels slow until it suddenly doesn't.",
  "Felt resistance today but the anchor cue worked. Tiny steps still move us forward.",
  "Just showing up is the victory today. One more brick in the foundation.",
  "Pushed through some brain fog. Glad I got the Body quest checked off.",
  "Felt good to connect. Voice quests always remind me I'm not in this alone.",
  "A quiet win today. No fanfare, just showing up for the work.",
  "The craft quest was small but it kept the streak alive. Forward is forward.",
  "Order breeds clarity. Cleaning that one surface felt surprisingly grounding.",
  "Reconnecting with family was a nice reminder of why I'm rebuilding my life.",
  "Felt tired but the anchor trigger made it easy to start. Fogg was right.",
  "My mind was racing today, but reading that one paragraph settled me down.",
  "It is amazing how a 2-minute effort can change the energy of the whole day.",
  "Not my best day, but the freeze saved my streak. Grateful for the forgiveness.",
  "Today was about consistency. The dip is real, but so is my commitment.",
  "Bit blocky still, but the lines are starting to emerge. Rendering in progress.",
  "A small vote today for the person I am trying to become. That counts.",
  "My focus was low, but I did the tiny action. No excuses, no regrets.",
  "Nice to get some fresh air. The Body quest got me moving when I wanted to scroll.",
  "Order is slowly returning to my desk. Less chaos, more space to think.",
  "Deci and Ryan were onto something. Autonomy over my schedule feels great today.",
  "Sent the message. Simple, but it sat on my to-do list for three days.",
  "Bonds pillar kept me grounded. A five-minute call goes a long way.",
  "Did the standard tier today. Felt capable and focused. Competence checked.",
  "A hard quest completed! Felt the drag early on, but pushed past it.",
  "The milestone is close. Can feel the static thinning out a bit.",
  "Weird how doing just one line of code gets you to write ten more. Start small.",
  "Felt a bit of dip today. Kept it to the tiny version and survived.",
  "Another day, another signal logged. Slowly sharpening the edges.",
  "Had to force myself to do it today, but I feel much better now that it is done.",
  "The cue was brushing my teeth. The habit just flowed. Anchors work.",
  "Glad I did the Bonds quest. Reaching out brought some needed perspective.",
  "My room looks a tiny bit cleaner. The Order pillar brings immediate calm.",
  "Read the page and found a nice quote. Mind expanded, even if just a bit.",
  "Took some time to breathe. It's not about racing; it's about rendering.",
  "Craft was satisfying today. Shipped a tiny refactor. Clean code, clean mind.",
  "Felt a bit blocky and slow, but stayed with it. The comeback is a crawl.",
  "Glad I called. Sometimes the voice is all you need to clear the static.",
  "Just a small action, but it felt like a heavy lift today. Proud I did it.",
  "The momentum is building. Almost halfway there. Visuals are sharpening."
];

// ---------------------------------------------------------
// MILESTONES
// ---------------------------------------------------------
const MILESTONES: Record<number, { title: string; message: string }> = {
  1: { title: "Boot Sequence begins", message: "Everything is blurry. That's the point. Let's start rendering." },
  7: { title: "First week rendered", message: "Seven signals logged. The static is thinning." },
  21: { title: "Boot complete", message: "You showed up 21 times. The outline of you is visible." },
  50: { title: "The Dip", message: "This is the hard part the science warned about. You're still here." },
  100: { title: "Halfway sharp", message: "You can see the face now. Keep going." },
  150: { title: "Plateau broken", message: "Progress went quiet for a bit. Then it didn't." },
  200: { title: "High Definition unlocked", message: "Almost fully rendered. Detail everywhere." },
  250: { title: "Runway complete", message: "Day 1 you couldn't see yourself. Look now." }
};

// ---------------------------------------------------------
// RUNWAY GENERATOR ENGINE
// ---------------------------------------------------------
function runSimulation(probScale: number, rng: SeededRandom): DayRecord[] {
  const days: DayRecord[] = [];
  let cumulativeXP = 0;
  let streak = 0;
  let freezesAvailable = 2;
  let consecutiveCleanDays = 0;

  // Track the primary pillar of the previous day to avoid repeating it
  let prevPrimaryPillar: Pillar | null = null;

  for (let day = 1; day <= 250; day++) {
    // 1. Identify Act
    let act: DayRecord["act"] = "Boot";
    if (day >= 22 && day <= 100) act = "Rendering";
    else if (day >= 101 && day <= 200) act = "Sharpening";
    else if (day >= 201) act = "HighDef";

    // 2. Base Completion Probability for the day
    let baseProb = 0.75;
    if (day <= 21) {
      // Linear climb from 0.55 to 0.85
      baseProb = 0.55 + ((day - 1) / 20) * 0.30;
    } else if (day >= 22 && day <= 50) {
      // early Rendering dip
      baseProb = 0.60; 
    } else if (day >= 51 && day <= 100) {
      // recovery
      baseProb = 0.75;
    } else if (day >= 101 && day <= 200) {
      // Sharpening stable ~0.85
      baseProb = 0.85;
      // 3-day plateau around day 150 (dips to ~0.60)
      if (day >= 148 && day <= 150) {
        baseProb = 0.60;
      }
    } else {
      // High Definition ~0.90+
      baseProb = 0.93;
    }

    // Apply the global tuning scale factor
    const p = Math.min(0.99, baseProb * probScale);

    // 3. Check for explicit missed days (consume streak freezes on Day 30 and Day 45)
    const isExplicitMissed = day === 30 || day === 45;

    // 4. Generate Energy level
    let energy: 1 | 2 | 3 = 2;
    if (isExplicitMissed) {
      energy = 1;
    } else {
      const roll = rng.next();
      if (roll < 0.2) energy = 1;
      else if (roll < 0.7) energy = 2;
      else energy = 3;
    }

    // 5. Generate Quests
    const quests: Quest[] = [];
    
    // Choose balanced pillars for this day (without repeating yesterday's primary pillar)
    const availablePillars = PILLARS.filter(pill => pill !== prevPrimaryPillar);
    // Sort remaining pillars randomly or in order of least recently used. 
    // For simplicity, we shuffle available pillars deterministically.
    const shuffledPillars = [...availablePillars].sort(() => rng.next() - 0.5);

    // Determine tiers based on energy
    const tiersForDay: Tier[] = [];
    if (energy === 1) {
      tiersForDay.push("Tiny");
    } else if (energy === 2) {
      tiersForDay.push("Standard", "Tiny");
    } else {
      tiersForDay.push("Hard", "Standard", "Tiny");
    }

    // Populate quest items
    tiersForDay.forEach((tier, index) => {
      const pillar = shuffledPillars[index % shuffledPillars.length];
      const pool = QUESTS_POOL[pillar][tier];
      const template = rng.pick(pool);
      quests.push({
        id: `day-${day}-${tier}-${index}`,
        pillar,
        tier,
        text: template.text,
        anchor: template.anchor,
        done: false
      });
    });

    // Update yesterday's primary pillar
    if (quests.length > 0) {
      prevPrimaryPillar = quests[0].pillar;
    }

    // 6. Complete Quests based on probability
    let completedCount = 0;
    if (!isExplicitMissed) {
      quests.forEach((q, idx) => {
        const questRoll = rng.next();
        if (questRoll < p) {
          q.done = true;
          completedCount++;
        }
      });

      // To guarantee that only the 2 scheduled missed days consume freezes,
      // if this is a regular day and by chance all quests rolled false,
      // we force the first quest to be completed.
      if (completedCount === 0 && quests.length > 0) {
        quests[0].done = true;
        completedCount = 1;
      }
    }

    // 7. Handle Streak and Freeze Logic
    let freezeUsed = false;
    if (completedCount > 0) {
      streak++;
      consecutiveCleanDays++;
      // Check for freeze regeneration: 1 freeze per 14 consecutive clean days
      if (consecutiveCleanDays === 14) {
        if (freezesAvailable < 2) {
          freezesAvailable++;
        }
        consecutiveCleanDays = 0;
      }
    } else {
      // Missed day
      consecutiveCleanDays = 0;
      if (freezesAvailable > 0) {
        freezesAvailable--;
        freezeUsed = true;
        // Streak remains flat (frozen)
      } else {
        streak = 0;
      }
    }

    // 8. Calculate Daily XP
    const completedQuests = quests.filter(q => q.done);
    const xpGained = calculateDailyXP(completedQuests, streak);
    cumulativeXP += xpGained;

    // 9. Calculate Resolution Percentage
    const resolutionPct = calculateResolutionPct(cumulativeXP);

    // 10. Pull Reflection Snippet
    const reflection = isExplicitMissed
      ? "Missed showing up. Yesterday caught up to me. The freeze saved my streak."
      : REFLECTIONS_POOL[(day - 1) % REFLECTIONS_POOL.length];

    // 11. Add Milestone if matching day
    const milestoneText = MILESTONES[day]?.message;

    days.push({
      day,
      act,
      energy,
      quests,
      reflection,
      streak,
      freezeUsed,
      xpGained,
      cumulativeXP,
      resolutionPct,
      ...(milestoneText ? { milestone: milestoneText } : {})
    });
  }

  return days;
}

// ---------------------------------------------------------
// AUTO-TUNING MAIN LOOP
// ---------------------------------------------------------
function main() {
  console.log("Seeding Journey Engine...");
  
  let scale = 0.85;
  let finalRes = 0;
  let days: DayRecord[] = [];

  // Tuning binary search / linear check loop
  for (let iter = 0; iter < 100; iter++) {
    // Reinitialize PRNG with a fixed seed so it's fully deterministic
    const rng = new SeededRandom(42); 
    days = runSimulation(scale, rng);
    finalRes = days[days.length - 1].resolutionPct;

    if (finalRes >= 97.0 && finalRes <= 99.0) {
      break;
    } else if (finalRes < 97.0) {
      scale += 0.01;
    } else {
      scale -= 0.01;
    }
  }

  // Calculate stats for reporting
  const missedDaysCount = days.filter(d => d.quests.every(q => !q.done)).length;
  const freezesUsedCount = days.filter(d => d.freezeUsed).length;

  console.log(`\nSimulation Tuned Successfully (Scale Factor: ${scale.toFixed(4)})`);
  console.log(`-----------------------------------------------------`);
  console.log(`Total Days: ${days.length}`);
  console.log(`Final Resolution: ${finalRes.toFixed(1)}%`);
  console.log(`Number of Missed Days: ${missedDaysCount}`);
  console.log(`Number of Freezes Used: ${freezesUsedCount}`);
  console.log(`-----------------------------------------------------`);
  
  const checkDays = [1, 21, 50, 100, 150, 200, 250];
  checkDays.forEach(d => {
    const record = days.find(r => r.day === d);
    if (record) {
      console.log(`Day ${String(d).padStart(3, " ")} | Act: ${record.act.padEnd(10, " ")} | XP: ${String(record.cumulativeXP).padStart(4, " ")} | Res: ${record.resolutionPct.toFixed(1)}%`);
    }
  });

  // Write journey JSON file
  const outputDir = path.join(__dirname);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const journeyData: Journey = {
    persona: "Default Persona",
    days
  };

  const outputPath = path.join(outputDir, "journey.json");
  fs.writeFileSync(outputPath, JSON.stringify(journeyData, null, 2), "utf8");
  console.log(`\nWritten journey JSON data to ${outputPath}`);
}

main();
