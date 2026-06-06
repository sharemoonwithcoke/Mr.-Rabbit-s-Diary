import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DiaryEntry } from "../services/api";
import { CLASS_CONFIG, LabelName } from "../constants";

interface Props {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const label  = entry.analysis?.label as LabelName | undefined;
  const cfg    = label ? (CLASS_CONFIG[label] ?? null) : null;
  const conf   = entry.analysis?.confidence;

  const date = new Date(entry.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(entry.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.textBlock}>
          {entry.title ? (
            <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>
          ) : null}
          <Text style={styles.preview} numberOfLines={3}>
            {entry.preview || entry.content}
          </Text>
        </View>

        <View style={styles.badgeBlock}>
          {cfg && label ? (
            <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={styles.badgeIcon}>{cfg.icon}</Text>
              <Text style={[styles.badgeText, { color: cfg.text }]}>{label}</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: "#f3f4f6" }]}>
              <Text style={[styles.badgeText, { color: "#9ca3af" }]}>No analysis</Text>
            </View>
          )}
          {conf != null && (
            <Text style={styles.conf}>{(conf * 100).toFixed(0)}% conf.</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{date} · {time}</Text>
        <TouchableOpacity onPress={() => onDelete(entry._id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  top:        { flexDirection: "row", gap: 12 },
  textBlock:  { flex: 1 },
  title:      { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 3 },
  preview:    { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  badgeBlock: { alignItems: "flex-end", gap: 4 },
  badge:      {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  badgeIcon:  { fontSize: 12 },
  badgeText:  { fontSize: 11, fontWeight: "600" },
  conf:       { fontSize: 11, color: "#9ca3af" },
  footer:     {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6",
  },
  date:       { fontSize: 11, color: "#9ca3af" },
  deleteText: { fontSize: 12, color: "#ef4444" },
});
