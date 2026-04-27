/**
 * Static demo readings for free-tier users.
 *
 * These are shown instead of making a real Claude call. They feel
 * "palm-like" but are obviously curated — not derived from the
 * user's actual photo. The purpose is to demonstrate the app's
 * output format and tone before asking for payment.
 *
 * Each reading is a self-contained JSON blob matching the same
 * shape as a real Claude response, so the mobile result screen
 * renders them identically.
 */

export interface DemoReading {
  lines: {
    life: string;
    heart: string;
    head: string;
    fate: string;
  };
  summary: string;
}

export const DEMO_READINGS: DemoReading[] = [
  {
    lines: {
      life:
        "Your life line arcs broadly across the mount of Venus — a sign of vitality and strong physical constitution. The unbroken sweep suggests resilience through life's surprises.",
      heart:
        "A long, curving heart line reveals deep emotional capacity. You feel intensely but have learned, or are learning, to channel that intensity rather than be overwhelmed by it.",
      head:
        "Your head line is straight and well-defined, pointing to a pragmatic, analytical mind. You prefer evidence over instinct, yet your line's slight upward curve hints at creative ambition waiting to be unlocked.",
      fate:
        "Your fate line begins strong at the wrist and continues upward without major breaks — a trajectory of steady professional progress. The slight fork near the middle suggests a meaningful career pivot in your thirties.",
    },
    summary:
      "Your palm tells the story of someone who balances emotional depth with sharp thinking. The broad life line and steady fate line form a foundation of resilience, while your heart and head lines suggest someone who doesn't choose between feeling and reasoning — they do both, and they do them well. A meaningful shift lies ahead, and your lines suggest you'll handle it with the same quiet strength that defines you.",
  },
  {
    lines: {
      life:
        "Your life line begins high near the index finger — a sign of ambition and a life lived with intention. The line is deep and unbroken, suggesting steady energy and an ability to bounce back from challenge.",
      heart:
        "A relatively straight heart line suggests emotional directness. You value honesty in relationships and have little patience for games. When you care, it's with your whole chest.",
      head:
        "A deeply etched head line that sweeps downward toward the lunar mount reveals a rich imagination paired with sharp memory. You're the kind of thinker who connects dots others miss.",
      fate:
        "Your fate line appears faint in the lower palm but strengthens as it rises — meaning your sense of purpose crystallized over time rather than being set from the start. Career clarity came through experience, not certainty.",
    },
    summary:
      "Your palm reveals a pattern of late-blooming clarity — someone whose ambition and emotional directness found their true direction through living, not planning. The strengthening fate line is the standout feature: your purpose didn't come pre-installed, it was earned. Combined with your imaginative head line and emotionally honest heart line, the picture is of someone who leads with integrity and thinks in ways others don't expect.",
  },
  {
    lines: {
      life:
        "A shorter but deeply etched life line — quality over quantity. This pattern suggests you invest heavily in the present rather than playing the long game, and your intensity leaves a mark on the people around you.",
      heart:
        "Your heart line is long and dramatically curved upward toward the index finger — a classic sign of someone who loves deeply, idealistically, and sometimes more than is wise. Your emotional generosity is your superpower and your vulnerability.",
      head:
        "A wavy head line suggests a mind that resists rigid structure. You think in spirals and patterns, not straight lines. This makes you creative and adaptive, though you may sometimes feel scattered.",
      fate:
        "A double fate line — one of the rarest features — indicates two simultaneous tracks in life: perhaps a day job and a passion, or a public role and a private one. You're building something parallel that others don't see yet.",
    },
    summary:
      "This is a palm that doesn't do anything halfway. The deeply etched life line, the soaring heart line, the double fate line — everything signals intensity and multiplicity. You're likely someone who feels pulled in two directions and worries it's a flaw, but your palm says the opposite: the double track is a feature, not a bug. Your challenge isn't choosing one path — it's trusting that both are real.",
  },
];

/**
 * Pick a deterministic demo reading for a given user ID so they
 * always see the same one. Rotates through the array based on
 * a hash of the user ID.
 */
export function pickDemoReading(userId: string): DemoReading {
  // Simple hash from userId to pick a stable index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return DEMO_READINGS[hash % DEMO_READINGS.length];
}