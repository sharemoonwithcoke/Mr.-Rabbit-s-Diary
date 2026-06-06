import { View, Text, StyleSheet } from "react-native";
import { AnalysisResult } from "../services/api";
import { CLASS_CONFIG, SAFE_RESOURCES, LABEL_NAMES, LabelName } from "../constants";

interface Props {
  result: AnalysisResult;
}

export default function ResultCard({ result }: Props) {
  const { label, confidence, probabilities, demo_mode } = result;
  const cfg      = CLASS_CONFIG[label as LabelName] ?? CLASS_CONFIG["Normal"];
  const resource = SAFE_RESOURCES[label as LabelName];

  const sorted = Object.entries(probabilities ?? {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <View style={[styles.card, { borderColor: cfg.color, borderWidth: 1.5 }]}>
      {demo_mode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Demo mode — no trained model loaded. Predictions are illustrative.
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Classification Result</Text>
          <View style={styles.labelRow}>
            <Text style={styles.icon}>{cfg.icon}</Text>
            <Text style={[styles.labelText, { color: cfg.color }]}>{label}</Text>
          </View>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.confidenceValue, { color: cfg.text }]}>
            {(confidence * 100).toFixed(1)}%
          </Text>
          <Text style={[styles.confidenceLabel, { color: cfg.text }]}>confidence</Text>
        </View>
      </View>

      {/* Resource tip */}
      {resource && (
        <View style={[styles.resource, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.resourceText, { color: cfg.text }]}>
            <Text style={{ fontWeight: "700" }}>Suggestion: </Text>
            {resource}
          </Text>
        </View>
      )}

      {/* Probability bars */}
      <Text style={styles.probTitle}>All Class Probabilities</Text>
      {sorted.map(([cls, prob]) => {
        const c = CLASS_CONFIG[cls as LabelName];
        return (
          <View key={cls} style={styles.probRow}>
            <Text style={styles.probLabel}>{cls}</Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(prob * 100).toFixed(1)}%` as any, backgroundColor: c?.color ?? "#9ca3af" },
                ]}
              />
            </View>
            <Text style={styles.probValue}>{(prob * 100).toFixed(1)}%</Text>
          </View>
        );
      })}

      <Text style={styles.disclaimer}>
        Not a substitute for professional mental health advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  demoBanner: {
    backgroundColor: "#fefce8",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  demoText: { fontSize: 12, color: "#92400e" },
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLabel: { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  icon:     { fontSize: 22 },
  labelText:{ fontSize: 22, fontWeight: "800" },
  confidenceBadge: { borderRadius: 12, padding: 10, alignItems: "center" },
  confidenceValue: { fontSize: 20, fontWeight: "800" },
  confidenceLabel: { fontSize: 11 },
  resource: { borderRadius: 10, padding: 12, marginBottom: 14 },
  resourceText: { fontSize: 13, lineHeight: 18 },
  probTitle: { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  probRow:  { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  probLabel:{ fontSize: 11, color: "#6b7280", width: 110 },
  barBg:    { flex: 1, height: 7, backgroundColor: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginHorizontal: 6 },
  barFill:  { height: 7, borderRadius: 4 },
  probValue:{ fontSize: 11, color: "#9ca3af", width: 38, textAlign: "right" },
  disclaimer:{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 12 },
});
