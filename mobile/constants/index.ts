// Set this to your computer's local IP when testing on a real device.
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: "http://192.168.0.10:5000"
export const API_BASE_URL = "http://localhost:5000";

export const LABEL_NAMES = [
  "Normal",
  "Depression",
  "Suicidal",
  "Anxiety",
  "Stress",
  "Bipolar",
  "Personality Disorder",
] as const;

export type LabelName = (typeof LABEL_NAMES)[number];

export const CLASS_CONFIG: Record<
  LabelName,
  { color: string; bg: string; icon: string; text: string }
> = {
  Normal:               { color: "#4CAF50", bg: "#F1F8F1", icon: "😊", text: "#2E7D32" },
  Depression:           { color: "#2196F3", bg: "#E8F4FD", icon: "💙", text: "#1565C0" },
  Suicidal:             { color: "#F44336", bg: "#FEECEB", icon: "🆘", text: "#C62828" },
  Anxiety:              { color: "#FF9800", bg: "#FFF3E0", icon: "😰", text: "#E65100" },
  Stress:               { color: "#9C27B0", bg: "#F3E5F5", icon: "😤", text: "#6A1B9A" },
  Bipolar:              { color: "#00BCD4", bg: "#E0F7FA", icon: "🔄", text: "#00838F" },
  "Personality Disorder": { color: "#795548", bg: "#EFEBE9", icon: "🌀", text: "#4E342E" },
};

export const SAFE_RESOURCES: Partial<Record<LabelName, string>> = {
  Suicidal:   "If you're in crisis, call or text 988 (Suicide & Crisis Lifeline).",
  Depression: "Consider speaking with a mental health professional or trusted person.",
  Anxiety:    "Slow breathing and grounding techniques can help in the moment.",
  Stress:     "Try to identify one thing you can address today, and rest if possible.",
  Bipolar:    "Maintaining a regular routine and staying in touch with your care team helps.",
  "Personality Disorder": "DBT therapy can be very effective — consider speaking with a therapist.",
};
