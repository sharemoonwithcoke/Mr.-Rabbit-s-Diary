import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";

interface Props {
  onSubmit: (content: string, title: string) => void;
  loading: boolean;
}

export default function JournalInput({ onSubmit, loading }: Props) {
  const [content, setContent] = useState("");
  const [title,   setTitle]   = useState("");

  const charCount   = content.length;
  const isOverLimit = charCount > 10000;
  const canSubmit   = content.trim().length >= 10 && !isOverLimit && !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(content.trim(), title.trim());
    setContent("");
    setTitle("");
  };

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title (optional)"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
        returnKeyType="next"
      />

      <TextInput
        style={styles.contentInput}
        placeholder="How are you feeling today? Write freely…"
        placeholderTextColor="#9ca3af"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        maxLength={10100}
      />

      <View style={styles.footer}>
        <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
          {charCount.toLocaleString()} / 10,000
        </Text>
        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyse & Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleInput: {
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  contentInput: {
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 130,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCount:     { fontSize: 12, color: "#9ca3af" },
  charCountOver: { color: "#ef4444" },
  button: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 130,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText:     { color: "#fff", fontSize: 14, fontWeight: "600" },
});
