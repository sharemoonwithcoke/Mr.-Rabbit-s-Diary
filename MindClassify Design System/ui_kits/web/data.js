// MindClassify shared data — labels, colors, sample entries, fake classifier.
// Mirrors mobile/constants/index.ts + backend companion behaviour.

window.LABELS = [
  "Normal", "Depression", "Suicidal", "Anxiety",
  "Stress", "Bipolar", "Personality Disorder"
];

window.CLASS_CONFIG = {
  Normal:                 { ink: "var(--color-normal-ink)",      bg: "var(--color-normal-bg)",      line: "var(--color-normal-line)",      icon: "😊", key: "normal" },
  Depression:             { ink: "var(--color-depression-ink)",  bg: "var(--color-depression-bg)",  line: "var(--color-depression-line)",  icon: "💙", key: "depression" },
  Suicidal:               { ink: "var(--color-suicidal-ink)",    bg: "var(--color-suicidal-bg)",    line: "var(--color-suicidal-line)",    icon: "🆘", key: "suicidal" },
  Anxiety:                { ink: "var(--color-anxiety-ink)",     bg: "var(--color-anxiety-bg)",     line: "var(--color-anxiety-line)",     icon: "😰", key: "anxiety" },
  Stress:                 { ink: "var(--color-stress-ink)",      bg: "var(--color-stress-bg)",      line: "var(--color-stress-line)",      icon: "😤", key: "stress" },
  Bipolar:                { ink: "var(--color-bipolar-ink)",     bg: "var(--color-bipolar-bg)",     line: "var(--color-bipolar-line)",     icon: "🔄", key: "bipolar" },
  "Personality Disorder": { ink: "var(--color-personality-ink)", bg: "var(--color-personality-bg)", line: "var(--color-personality-line)", icon: "🌀", key: "personality" },
};

window.SAFE_RESOURCES = {
  Suicidal:   "If you're in crisis, please call or text 988 (Suicide & Crisis Lifeline).",
  Depression: "Consider reaching out to a mental health professional or trusted person.",
  Anxiety:    "Breathing exercises and grounding techniques can help in the moment.",
  Stress:     "Try to identify one stressor you can address today, and rest if possible.",
  Bipolar:    "Maintaining a regular routine and consulting your care team is important.",
  "Personality Disorder": "Dialectical Behaviour Therapy (DBT) can be very effective — consider speaking with a therapist.",
};

// Pre-canned diary companion replies per label — used when Claude isn't reachable.
window.FALLBACK_REPLIES = {
  Normal:     "Today read like a quiet good page — nothing dramatic, just the soft sound of you living. Hold this one.",
  Depression: "The weight you described is real, and naming it here counts for something. Let one small kindness — even a cup of warm water — be enough this evening.",
  Suicidal:   "I hear how heavy this has become, and I'm grateful you wrote it down instead of carrying it alone. And if the weight ever becomes too heavy to carry alone, please reach out to the 988 Suicide & Crisis Lifeline — call or text 988.",
  Anxiety:    "The tightness you felt was your body asking for tenderness, not a verdict. Let one slow breath be a small returning home.",
  Stress:     "So much is pulling at you at once — that's not a flaw of yours, it's just the shape of this week. Pick one thread to put down for tonight.",
  Bipolar:    "There is a rhythm under all of this, even when it feels like noise. Sleep, water, and a steady hand belong to you, too.",
  "Personality Disorder": "What you felt was big, and feeling things big is not the same as being broken. Let the day end on your terms, gently.",
};

// Tiny demo "classifier" — keyword heuristics that mimic the model service in demo mode.
window.fakeClassify = function (text) {
  const t = text.toLowerCase();
  const scores = { Normal: 0.05, Depression: 0.05, Suicidal: 0.02, Anxiety: 0.05, Stress: 0.05, Bipolar: 0.03, "Personality Disorder": 0.03 };
  const add = (k, n) => { scores[k] += n; };

  if (/\b(suicid|end it|kill myself|don't want to be|can't go on|no reason to live|hurt myself)\b/.test(t)) add("Suicidal", 0.7);
  if (/\b(hopeless|empty|worthless|numb|nothing matters|too tired|can't get out of bed|lonely|sad)\b/.test(t)) add("Depression", 0.5);
  if (/\b(panic|anxious|racing|worry|worried|nervous|shaking|on edge|heart pounding|tight chest|breathe)\b/.test(t)) add("Anxiety", 0.5);
  if (/\b(stress|overwhelm|deadline|too much|burned out|workload|pressure|behind on)\b/.test(t)) add("Stress", 0.5);
  if (/\b(manic|high then low|spending spree|euphoric|crash|mood swing|impulsive|reckless)\b/.test(t)) add("Bipolar", 0.5);
  if (/\b(unstable|abandon|love.then.hate|empty inside|don't know who I am|fear of being left)\b/.test(t)) add("Personality Disorder", 0.5);
  if (/\b(good day|grateful|happy|content|laughed|sunshine|walk|coffee|hopeful)\b/.test(t)) add("Normal", 0.5);

  // Normalize
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  Object.keys(scores).forEach(k => scores[k] = scores[k] / total);

  // Pick label
  let label = "Normal", best = -1;
  for (const k of Object.keys(scores)) if (scores[k] > best) { best = scores[k]; label = k; }

  return {
    label,
    confidence: Math.min(0.97, Math.max(0.42, scores[label] + 0.08)),
    probabilities: scores,
    demo_mode: true,
  };
};

// Tender, ambient follow-up lines. In production these would route through Claude;
// here they rotate so the demo feels conversational without being repetitive.
window.FOLLOWUP_REPLIES_GENERIC = [
  "Yes — hold still there for a moment. Don't move past it too fast.",
  "Mm. Let me sit with that with you for a second.",
  "I hear you. Keep going if there's more — I'm in no hurry.",
  "That's a real thing to feel. It doesn't need solving tonight.",
  "Notice that you came back to say it again. That counts.",
];

// Seed entries for History view
window.SEED_ENTRIES = [
  {
    _id: "e1", title: "A long Tuesday",
    content: "Tried to take the morning slow. The tight feeling in my chest didn't lift until I got outside and saw the light hitting the leaves. Maybe that's enough for today.",
    analysis: { label: "Anxiety", confidence: 0.823, demo_mode: true },
    reply: "The tightness was your body asking for tenderness, not a verdict. You went outside, and the leaves were waiting — that's not nothing. Let the breath you just took be enough for now.",
    followups: [
      { user: "But I keep ending up here every Tuesday.",
        reply: "And every Tuesday you also come back to the leaves. That part is yours, not the day's.",
        at: "2026-05-24T14:36:00Z" },
    ],
    createdAt: "2026-05-24T14:32:00Z",
  },
  {
    _id: "e2", title: "After the meeting",
    content: "Two deadlines and one I forgot about. I keep putting my shoulders by my ears. Need to get to bed before midnight.",
    analysis: { label: "Stress", confidence: 0.764, demo_mode: true },
    reply: "So many threads pulling at you at once — that isn't a flaw of yours, it's the shape of this week. Pick one thread to put down for tonight, and let the rest wait for morning.",
    createdAt: "2026-05-23T22:11:00Z",
  },
  {
    _id: "e3", title: "Sunday walk",
    content: "Long slow walk through the park with a coffee. Nothing remarkable; everything fine. Grateful for an empty afternoon.",
    analysis: { label: "Normal", confidence: 0.881, demo_mode: true },
    reply: "Today read like a quiet good page — no drama, just the soft sound of you living. Hold this one. It counts as much as the loud ones.",
    createdAt: "2026-05-22T15:04:00Z",
  },
  {
    _id: "e4", title: "",
    content: "Couldn't get out of bed until eleven. The light feels far away. I know this passes. I don't believe it right now though.",
    analysis: { label: "Depression", confidence: 0.792, demo_mode: true },
    reply: "The weight you described is real, and naming it here counts for something. You don't have to believe yet — keep the door open a crack and let one small kindness through.",
    createdAt: "2026-05-20T11:48:00Z",
  },
  {
    _id: "e5", title: "Late thoughts",
    content: "Heart racing again. The list of things I can't fix is longer than the list of things I can. Breathing slow now.",
    analysis: { label: "Anxiety", confidence: 0.701, demo_mode: true },
    reply: "The list grows long when the room is quiet — that's the time of night, not the truth of you. Slow breathing is already a kindness. Let tonight be small.",
    createdAt: "2026-05-19T23:55:00Z",
  },
];

window.formatDate = function (iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
window.formatTime = function (iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
window.todayLong = function () {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" });
};
