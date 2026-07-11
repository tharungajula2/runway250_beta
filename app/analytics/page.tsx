"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import PageTransition from "@/components/PageTransition";
import journeyData from "@/lib/data/journey.json";
import { mockCohortData } from "@/lib/data/mockCohort";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  ReferenceDot,
} from "recharts";
import { TrendingUp, Users, Target, Activity, Flame, ShieldAlert } from "lucide-react";
import { useRunwayStore } from "@/store/useRunwayStore";
import { useRouter } from "next/navigation";

export default function Analytics() {
  const [mounted, setMounted] = useState(false);
  const { mode } = useRunwayStore();
  const router = useRouter();

  useEffect(() => {
    if (mode !== "pitch") {
      router.replace("/journey");
    } else {
      setMounted(true);
    }
  }, [mode, router]);

  if (!mounted || mode !== "pitch") {
    return null;
  }

  // 1. Resolution growth chart data (downsampled to every 10th day to prevent SVG noise, including Day 250)
  const resolutionData = journeyData.days
    .filter((d: any) => d.day === 1 || d.day % 10 === 0 || d.day === 250)
    .map((d: any) => ({
      day: d.day,
      resolution: d.resolutionPct,
      milestone: d.milestone || null,
    }));

  // Find coordinates of milestones on the chart
  const milestonesOnChart = resolutionData.filter((pt) => pt.milestone);

  // 2. Pillar balance calculation
  const pillarCounts: { [key: string]: { total: number; completed: number } } = {
    mind: { total: 0, completed: 0 },
    fitness: { total: 0, completed: 0 },
    spaces: { total: 0, completed: 0 },
    career: { total: 0, completed: 0 },
    finance: { total: 0, completed: 0 },
    social: { total: 0, completed: 0 },
  };

  journeyData.days.forEach((day: any) => {
    day.quests.forEach((q: any) => {
      const p = q.pillar;
      if (pillarCounts[p]) {
        pillarCounts[p].total++;
        if (q.done) {
          pillarCounts[p].completed++;
        }
      }
    });
  });

  const radarData = Object.keys(pillarCounts).map((key) => ({
    pillar: key.charAt(0).toUpperCase() + key.slice(1),
    rate: Math.round((pillarCounts[key].completed / pillarCounts[key].total) * 100),
  }));

  // 3. Completion rate over time: 10-day buckets showing the Day 20-50 dip & recovery
  const bucketSize = 10;
  const barData = [];
  for (let i = 0; i < 250; i += bucketSize) {
    const slice = journeyData.days.slice(i, i + bucketSize);
    let total = 0;
    let completed = 0;
    slice.forEach((day: any) => {
      day.quests.forEach((q: any) => {
        total++;
        if (q.done) completed++;
      });
    });
    const avg = total > 0 ? Math.round((completed / total) * 100) : 0;
    barData.push({
      range: `D${i + 1}`,
      rate: avg,
    });
  }

  // 4. Weekly active pattern data: Active days per week for the first 12 weeks
  const weekData = [];
  for (let w = 0; w < 12; w++) {
    const daysSlice = journeyData.days.slice(w * 7, (w + 1) * 7);
    let activeDays = 0;
    daysSlice.forEach((day: any) => {
      const hasCompleted = day.quests.some((q: any) => q.done);
      if (hasCompleted) activeDays++;
    });
    weekData.push({
      week: `W${w + 1}`,
      activeDays,
    });
  }

  // Custom Dot for milestone markers on AreaChart
  const renderMilestoneDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.milestone) {
      return (
        <g key={`dot-${payload.day}`}>
          <circle cx={cx} cy={cy} r={6} fill="var(--color-signal-amber)" stroke="white" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={10} fill="none" stroke="var(--color-signal-amber)" strokeWidth={1} className="animate-pulse" />
        </g>
      );
    }
    return <circle key={`dot-${payload.day}`} cx={cx} cy={cy} r={2} fill="var(--color-teal)" />;
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full pb-20">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
          Behavior Analytics
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Quantitative telemetry of the 250-day simulated cohort and habits.
        </p>
      </div>

      {/* Warning Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed font-mono">
        <ShieldAlert size={14} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">PROTOTYPE telemetry:</span> All metrics and user indices plotted are simulated models illustrating habit persistence curves.
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="surface" className="p-4 flex flex-col justify-between h-24 border-teal/10">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase">Stickiness Ratio</span>
            <Activity size={14} className="text-teal" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-teal font-heading">31.4%</span>
            <p className="text-[9px] text-text-muted mt-0.5 font-mono">&gt;25% = strong (AppsFlyer)</p>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between h-24 border-teal/10">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase">Target D30 Retention</span>
            <Users size={14} className="text-teal" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-teal font-heading">14.0%</span>
            <p className="text-[9px] text-text-muted mt-0.5 font-mono">VS 7.0% category median</p>
          </div>
        </Card>
      </div>

      {/* Area Chart: Resolution Growth */}
      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-teal uppercase tracking-wider font-heading flex items-center gap-1.5">
            <TrendingUp size={13} /> Avatar Resolution Growth
          </h3>
          <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded select-none">
            SIMULATED DATA
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          The 250-day saturating focus-pull. Amber beacons denote key narrative acts and milestone unlocks.
        </p>

        <div className="w-full h-44 mt-1 font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={resolutionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-teal)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" stroke="var(--color-text-muted)" tickLine={false} />
              <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-app)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
              />
              <Area
                type="monotone"
                dataKey="resolution"
                stroke="var(--color-teal)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRes)"
                dot={renderMilestoneDot}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Line Chart: Target Retention vs Category Median */}
      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-teal uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Users size={13} /> Cohort Retention Decay (30d)
          </h3>
          <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded select-none">
            SIMULATED DATA
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Logarithmic decay comparing the proposed Runway 250 habit loop against common utilities.
        </p>

        <div className="w-full h-44 mt-1 font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockCohortData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" stroke="var(--color-text-muted)" tickLine={false} />
              <YAxis domain={[0, 45]} stroke="var(--color-text-muted)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-app)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="runwayCohort"
                name="Runway 250"
                stroke="var(--color-teal)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="industryMedian"
                name="Category Median"
                stroke="var(--color-text-muted)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <span className="text-[9px] text-text-muted font-bold font-mono text-center block mt-1 uppercase tracking-wider">
          ambitious target vs. category median (Adjust 2026)
        </span>
      </Card>

      {/* Radar Chart: Pillar Balance */}
      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-teal uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Target size={13} /> Pillar Balance Allocation
          </h3>
          <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded select-none">
            SIMULATED DATA
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Aggregated completion rates across all 6 behavioral pillars. Higher symmetry yields balanced recovery.
        </p>

        <div className="w-full h-48 mt-1 font-mono text-[9px] flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(0,0,0,0.06)" />
              <PolarAngleAxis dataKey="pillar" stroke="var(--color-text-primary)" style={{ fontSize: "9px" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-text-muted)" style={{ fontSize: "8px" }} />
              <Radar
                name="Completion Rate"
                dataKey="rate"
                stroke="var(--color-teal)"
                fill="var(--color-teal)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bar Chart: Completion Rate Over Time */}
      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-teal uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Activity size={13} /> Habit Completion Progression
          </h3>
          <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded select-none">
            SIMULATED DATA
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Binned average completions in 10-day increments. Demonstrates the day 20–50 dip and recovery.
        </p>

        <div className="w-full h-40 mt-1 font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="range" stroke="var(--color-text-muted)" tickLine={false} />
              <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-app)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
              />
              <Bar dataKey="rate" fill="var(--color-teal)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <span className="text-[9px] text-text-muted font-bold font-mono text-center block mt-1 uppercase tracking-wider">
          the motivational trough the science predicts — and the design absorbs
        </span>
      </Card>

      {/* Weekly Active Pattern Strip */}
      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-teal uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Flame size={13} /> Weekly Active Pattern Strip
          </h3>
          <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded select-none">
            SIMULATED DATA
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Heatmap displaying active commitment days per week across the initial 12 weeks of rendering.
        </p>

        {/* Custom Contribution-style strip */}
        <div className="flex justify-between gap-1 mt-2">
          {weekData.map((w) => (
            <div key={w.week} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[8px] font-bold font-mono text-text-muted">{w.week}</span>
              <div className="w-full flex flex-col gap-1">
                {/* Visual blocks representation */}
                {[...Array(7)].map((_, idx) => {
                  const active = idx < w.activeDays;
                  return (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-sm border transition-colors ${
                        active
                          ? "bg-teal border-teal/20"
                          : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-750"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[8px] font-bold text-text-muted font-mono mt-0.5">{w.activeDays}d</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </PageTransition>
  );
}
