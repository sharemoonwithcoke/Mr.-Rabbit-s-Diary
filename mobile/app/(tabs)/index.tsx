import { useState } from "react";
import {
  View, ScrollView, Text, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { analyzeText, createEntry, getCompanionResponse, AnalysisResult } from "../../services/api";
import JournalInput from "../../components/JournalInput";
import ResultCard from "../../components/ResultCard";
import CompanionCard from "../../components/CompanionCard";

export default function HomeScreen() {
  const [loading,           setLoading]           = useState(false);
  const [companionLoading,  setCompanionLoading]  = useState(false);
  const [result,            setResult]            = useState<AnalysisResult | null>(null);
  const [companionResponse, setCompanionResponse] = useState<string | null>(null);
  const [saved,             setSaved]             = useState(false);
  const [error,             setError]             = useState<string | null>(null);

  const handleSubmit = async (content: string, title: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCompanionResponse(null);
    setSaved(false);

    try {
      const analysis = await analyzeText(content);
      await createEntry({ content, title: title || undefined, analysis });
      setResult(analysis);
      setSaved(true);

      // Get companion response non-blocking
      setCompanionLoading(true);
      getCompanionResponse(content, analysis.label)
        .then((data) => { if (data?.response) setCompanionResponse(data.response); })
        .catch(() => {})
        .finally(() => setCompanionLoading(false));

    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Could not reach the server. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Write freely — your diary will listen, and write back.
        </Text>

        <JournalInput onSubmit={handleSubmit} loading={loading} />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {saved && !error && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Entry saved successfully.</Text>
          </View>
        )}

        {result && <ResultCard result={result} />}

        {(companionLoading || companionResponse) && (
          <CompanionCard response={companionResponse} loading={companionLoading} />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content:   { padding: 16 },
  subtitle:  { fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 18 },
  errorBox:  {
    backgroundColor: "#fef2f2", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#fecaca", marginTop: 12,
  },
  errorText:   { color: "#b91c1c", fontSize: 13 },
  successBox:  {
    backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#bbf7d0", marginTop: 12,
  },
  successText: { color: "#15803d", fontSize: 13 },
});
