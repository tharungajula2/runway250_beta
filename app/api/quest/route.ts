import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { buildPrompt, SYSTEM_ROLE } from "@/lib/ai/prompt";

// Initialize using the server-side environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Easily swappable model constant
const QUEST_MASTER_MODEL = "gemini-3.1-flash-lite";

export async function POST(req: Request) {
  try {
    // Check key presence first
    if (!process.env.GEMINI_API_KEY) {
      console.warn("QUEST_ROUTE: GEMINI_API_KEY is not defined, triggering fallback.");
      return NextResponse.json({ error: "fallback" }, { status: 502 });
    }

    const { pillars, recentHistory, energy } = await req.json();

    const response = await ai.models.generateContent({
      model: QUEST_MASTER_MODEL,
      contents: buildPrompt({ pillars, recentHistory, energy }),
      config: {
        systemInstruction: SYSTEM_ROLE,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pillar: { type: "string" },
              tier: { type: "string" }, // Tiny | Standard | Hard
              text: { type: "string" },
              anchor: { type: "string" },
              isHunt: { type: "boolean" },
            },
            required: ["pillar", "tier", "text", "anchor"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const quests = JSON.parse(text);
    return NextResponse.json({ quests, source: "LIVE_AI" });
  } catch (e: any) {
    console.error("QUEST_ROUTE_ERROR:", e.message || e);
    // Graceful 502 triggers client-side silent fallback
    return NextResponse.json({ error: "fallback" }, { status: 502 });
  }
}
