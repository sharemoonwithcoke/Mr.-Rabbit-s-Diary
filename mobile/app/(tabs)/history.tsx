import { useState, useEffect, useCallback } from "react";
import {
  View, FlatList, Text, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from "react-native";
import { getEntries, deleteEntry, DiaryEntry } from "../../services/api";
import EntryCard from "../../components/EntryCard";

export default function HistoryScreen() {
  const [entries,    setEntries]    = useState<DiaryEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [error,      setError]      = useState<string | null>(null);

  const fetchEntries = useCallback(async (p: number, refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);
    try {
      const data = await getEntries(p, 10);
      setEntries(data.entries);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load entries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(page); }, [fetchEntries, page]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Entry", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteEntry(id);
            setEntries((prev) => prev.filter((e) => e._id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete entry.");
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchEntries(page)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>{total} entries total</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📓</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Write your first journal entry on the Journal tab.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchEntries(page, true); }}
            tintColor="#4f46e5"
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p - 1)}
            disabled={page <= 1}
          >
            <Text style={styles.pageBtnText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            <Text style={styles.pageBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#f9fafb" },
  center:          { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  countText:       { fontSize: 12, color: "#9ca3af", paddingHorizontal: 16, paddingTop: 12 },
  errorText:       { color: "#b91c1c", textAlign: "center", marginBottom: 12 },
  retryBtn:        { backgroundColor: "#4f46e5", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText:       { color: "#fff", fontWeight: "600" },
  empty:           { alignItems: "center", paddingTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyTitle:      { fontSize: 17, fontWeight: "600", color: "#374151", marginBottom: 6 },
  emptyText:       { fontSize: 13, color: "#9ca3af", textAlign: "center" },
  pagination:      {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  pageBtn:         { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#f3f4f6", borderRadius: 8 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText:     { fontSize: 13, fontWeight: "600", color: "#374151" },
  pageInfo:        { marginHorizontal: 16, fontSize: 13, color: "#6b7280" },
});
