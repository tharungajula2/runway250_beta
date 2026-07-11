import { useRunwayStore } from "@/store/useRunwayStore";

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type: "quest_complete" | "day_complete" | "envelope_open" | "scrub_tick" | "boot_up") => {
  if (typeof window === "undefined") return;
  
  // Check store setting
  const enabled = useRunwayStore.getState().soundEnabled;
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create master gain node for soft, low volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, now); // Low master volume default
    masterGain.connect(ctx.destination);

    switch (type) {
      case "quest_complete": {
        // Soft warm blip (gentle marimba note style: fast attack, medium decay, high-ish pitch)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5 glide
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      
      case "day_complete": {
        // Slightly fuller two-note resolve (chord or arpeggio resolve)
        const playNote = (freq: number, startDelay: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "triangle"; // Warm triangle
          osc.frequency.setValueAtTime(freq, now + startDelay);
          
          gain.gain.setValueAtTime(0, now + startDelay);
          gain.gain.linearRampToValueAtTime(0.4, now + startDelay + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + duration);
          
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now + startDelay);
          osc.stop(now + startDelay + duration + 0.05);
        };
        
        playNote(329.63, 0.0, 0.35); // E4
        playNote(440.00, 0.12, 0.5); // A4 (rising resolve)
        break;
      }
      
      case "envelope_open": {
        // Quiet paper-slide (bandpass filtered white noise sweep)
        const bufferSize = ctx.sampleRate * 0.3; // 0.3s
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.setValueAtTime(3.0, now);
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(1300, now + 0.25);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        noise.start(now);
        noise.stop(now + 0.35);
        break;
      }
      
      case "scrub_tick": {
        // Barely-there tick as scrubber crosses a chapter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880.00, now); // A5 high tick
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      
      case "boot_up": {
        // Single low warm tone under the boot-up sequence
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(110.00, now); // A2 low warmth
        osc.frequency.linearRampToValueAtTime(115.00, now + 1.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.3); // Slow attack
        gain.gain.linearRampToValueAtTime(0.4, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Fade out
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 1.6);
        break;
      }
    }
  } catch (err) {
    console.warn("Web Audio failed to play sound:", err);
  }
};

export const triggerHaptic = (ms = 15) => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      // Ignore haptic errors gracefully
    }
  }
};

let endingDroneOsc: OscillatorNode | null = null;
let endingDroneGain: GainNode | null = null;

export const startEndingDrone = () => {
  if (typeof window === "undefined") return;
  const enabled = useRunwayStore.getState().soundEnabled;
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (endingDroneOsc) {
      try {
        endingDroneOsc.stop();
      } catch (e) {}
      endingDroneOsc = null;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(90.0, now); // Low 90Hz warm hum

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 1.0); // Gentle 1s fade-in

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, now);
    masterGain.connect(ctx.destination);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    endingDroneOsc = osc;
    endingDroneGain = gain;
  } catch (err) {
    console.warn("Failed to start ending drone:", err);
  }
};

export const stopEndingDrone = () => {
  if (typeof window === "undefined") return;
  try {
    if (endingDroneOsc && endingDroneGain) {
      if (audioCtx) {
        const now = audioCtx.currentTime;
        endingDroneGain.gain.cancelScheduledValues(now);
        endingDroneGain.gain.setValueAtTime(endingDroneGain.gain.value, now);
        endingDroneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Smooth 0.5s fade out
        
        const osc = endingDroneOsc;
        setTimeout(() => {
          try {
            osc.stop();
          } catch (e) {}
        }, 600);
      } else {
        endingDroneOsc.stop();
      }
    }
  } catch (err) {
    console.warn("Failed to stop ending drone:", err);
  } finally {
    endingDroneOsc = null;
    endingDroneGain = null;
  }
};

