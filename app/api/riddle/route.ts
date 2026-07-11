import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { buildRiddlePrompt, RIDDLE_SYSTEM_ROLE } from "@/lib/ai/prompt";

// Initialize using the server-side environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Easily swappable model constant
const RIDDLE_MODEL = "gemini-3.1-flash-lite";

export async function POST(req: Request) {
  try {
    // Check key presence first
    if (!process.env.GEMINI_API_KEY) {
      console.warn("RIDDLE_ROUTE: GEMINI_API_KEY is not defined, triggering fallback.");
      return NextResponse.json({ error: "fallback" }, { status: 502 });
    }

    const { completedQuests } = await req.json();

    const response = await ai.models.generateContent({
      model: RIDDLE_MODEL,
      contents: buildRiddlePrompt({ completedQuests }),
      config: {
        systemInstruction: RIDDLE_SYSTEM_ROLE,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            riddle: { type: "string" },
            answer: { type: "string" },
          },
          required: ["riddle", "answer"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text);
    return NextResponse.json({
      riddle: data.riddle,
      answer: data.answer.toLowerCase().trim(),
      source: "LIVE_AI"
    });
  } catch (e: any) {
    console.error("RIDDLE_ROUTE_ERROR:", e.message || e);
    // Graceful 502 triggers client-side silent fallback
    return NextResponse.json({ error: "fallback" }, { status: 502 });
  }
}
