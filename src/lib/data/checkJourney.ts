import * as fs from "fs";
import * as path from "path";

interface Quest {
  id: string;
  pillar: string;
  tier: string;
  text: string;
  anchor: string;
  done: boolean;
}

interface DayRecord {
  day: number;
  act: string;
  energy: number;
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

function main() {
  const jsonPath = path.join(__dirname, "journey.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: ${jsonPath} does not exist. Run "npm run seed" first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf8");
  const journey = JSON.parse(raw) as Journey;
  const days = journey.days;

  const totalDays = days.length;
  const finalRecord = days[days.length - 1];
  const finalResolution = finalRecord.resolutionPct;
  const missedDaysCount = days.filter(d => d.quests.every(q => !q.done)).length;
  const freezesUsedCount = days.filter(d => d.freezeUsed).length;

  console.log("Validation check for generated journey.json:");
  console.log(`- Total days: ${totalDays}`);
  console.log(`- Final resolution %: ${finalResolution}%`);
  console.log(`- Number of missed days: ${missedDaysCount}`);
  console.log(`- Number of freezes used: ${freezesUsedCount}`);
  console.log("\nResolution curve at key checkpoints:");
  
  const checkDays = [1, 21, 50, 100, 150, 200, 250];
  checkDays.forEach(d => {
    const record = days.find(r => r.day === d);
    if (record) {
      console.log(`  Day ${String(d).padStart(3, " ")}: ${record.resolutionPct.toFixed(1)}% (Act: ${record.act})`);
    }
  });
}

main();
