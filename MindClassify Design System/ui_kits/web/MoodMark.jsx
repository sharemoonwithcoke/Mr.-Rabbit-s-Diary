// Reusable mood marks — the same stroke set used on the brand iconography card.
// Used in the calendar/envelope seals. No emoji.

function MoodMark({ label, size = 22, stroke = "currentColor", strokeWidth = 1.6 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (label) {
    case "Normal": // a small sprig / new growth
      return (
        <svg {...common}>
          <path d="M12 20 V8" />
          <path d="M12 13 Q8 12 7 8 Q11 8.5 12 12" />
          <path d="M12 11 Q16 10 17 6 Q13 6.5 12 10" />
        </svg>
      );
    case "Depression": // a single heavy droplet
      return (
        <svg {...common}>
          <path d="M12 5 C8 11 7 14 7 16 a5 5 0 0 0 10 0 c0 -2 -1 -5 -5 -11Z" />
        </svg>
      );
    case "Suicidal": // life-preserver ring (the 988 lifeline)
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 4 V7.5" /><path d="M12 16.5 V20" />
          <path d="M4 12 H7.5" /><path d="M16.5 12 H20" />
        </svg>
      );
    case "Anxiety": // concentric ripples / racing pulse
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.8" fill={stroke} stroke="none" />
          <path d="M7.5 12 a 4.5 4.5 0 0 1 9 0" />
          <path d="M4.5 12 a 7.5 7.5 0 0 1 15 0" opacity="0.55" />
        </svg>
      );
    case "Stress": // a tight, compressed coil
      return (
        <svg {...common}>
          <path d="M5 8 Q12 5 19 8 Q12 11 5 14 Q12 17 19 14" />
        </svg>
      );
    case "Bipolar": // a wave with peak and trough
      return (
        <svg {...common}>
          <path d="M4 12 Q8 4 12 12 T20 12" />
        </svg>
      );
    case "Personality Disorder": // an open, shifting spiral
      return (
        <svg {...common}>
          <path d="M12 12 m -1 0 a 1 1 0 1 1 2 0 a 2.5 2.5 0 1 1 -4.5 1 a 5 5 0 1 1 9 -2 a 7.5 7.5 0 1 1 -13.5 3" />
        </svg>
      );
    default:
      return <svg {...common}><circle cx="12" cy="12" r="6" /></svg>;
  }
}

window.MoodMark = MoodMark;
