import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

interface Props {
  response: string | null;
  loading: boolean;
}

export default function CompanionCard({ response, loading }: Props) {
  if (!loading && !response) return null;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.quill}>🪶</Text>
        <Text style={styles.headerText}>YOUR DIARY REPLIES</Text>
      </View>

      <View style={styles.divider} />

      {/* Body */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#b45309" />
          <Text style={styles.loadingText}>Your diary is writing back…</Text>
        </View>
      ) : (
        <Text style={styles.response}>{response}</Text>
      )}

      {/* Footer */}
      {!loading && (
        <Text style={styles.footer}>— written for you, {today}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fdfaf4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 18,
    marginTop: 16,
    shadowColor: "#92400e",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  quill:      { fontSize: 18 },
  headerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#b45309",
  },
  divider: {
    height: 1,
    backgroundColor: "#fde68a",
    marginBottom: 12,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  loadingText: { fontSize: 13, color: "#b45309", fontStyle: "italic" },
  response: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  footer: {
    fontSize: 11,
    color: "#d97706",
    textAlign: "right",
    marginTop: 12,
    fontStyle: "italic",
  },
});
