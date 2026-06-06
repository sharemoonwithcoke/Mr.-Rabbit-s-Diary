/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Page surfaces
        cream:      "#FBF6EC",
        paper:      "#FFFCF6",
        "paper-warm": "#FDF8EF",
        "paper-deep": "#F5EBDA",

        // Ink (warm brown-blacks)
        ink:        "#3C2E22",
        "ink-2":    "#6B5446",
        "ink-3":    "#9C8676",
        "ink-4":    "#C7B49E",

        // Borders
        line:       "#EFE3CE",
        "line-soft":"#F5ECDA",

        // Brand action
        honey:      "#D97706",
        "honey-hover": "#B45309",
        "honey-soft":  "#FDF1DC",
        "honey-ink":   "#92400E",

        // Diary companion
        "diary-bg":   "#FDFAF4",
        "diary-line": "#FDE68A",
        "diary-accent":"#B45309",

        // Mood classes — cozy reskin
        "normal-ink":  "#5B8C6A",
        "normal-bg":   "#ECF2EC",
        "normal-line": "#C8DBC9",

        "depression-ink":  "#6B8FB5",
        "depression-bg":   "#E6EDF4",
        "depression-line": "#C5D5E5",

        "suicidal-ink":  "#C75440",
        "suicidal-bg":   "#F8E4DC",
        "suicidal-line": "#EBC2B2",

        "anxiety-ink":  "#D17A1E",
        "anxiety-bg":   "#FAEDD8",
        "anxiety-line": "#ECCFA0",

        "stress-ink":  "#9A6F95",
        "stress-bg":   "#EFE5EE",
        "stress-line": "#D9C3D6",

        "bipolar-ink":  "#4E9499",
        "bipolar-bg":   "#DCEEEE",
        "bipolar-line": "#B6DBDC",

        "personality-ink":  "#8B6D4F",
        "personality-bg":   "#EEE4D8",
        "personality-line": "#D6C2A8",
      },
      fontFamily: {
        sans:  ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "ui-serif", "serif"],
        hand:  ["Caveat", "Lora", "cursive"],
      },
      borderRadius: {
        "ds-sm": "10px",
        "ds-md": "14px",
        "ds-lg": "18px",
        "ds-xl": "24px",
      },
      boxShadow: {
        "warm-sm":  "0 2px 6px rgba(146,100,64,0.06), 0 1px 2px rgba(146,100,64,0.04)",
        "warm-md":  "0 6px 18px rgba(146,100,64,0.08), 0 2px 4px rgba(146,100,64,0.05)",
        "warm-lg":  "0 18px 40px rgba(146,100,64,0.10), 0 4px 12px rgba(146,100,64,0.06)",
        "warm-cozy":"0 20px 50px -10px rgba(146,100,64,0.16)",
      },
    },
  },
  plugins: [],
};
