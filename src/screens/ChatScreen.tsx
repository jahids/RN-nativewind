import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useChatStore } from "../store/chatStore";
import { MessageList } from "../components/MessageList";
import { Composer } from "../components/Composer";
import { ConfirmBar } from "../components/ConfirmBar";

export const ChatScreen: React.FC = () => {
  const { state, sendUserMessage, retryLast, cancelInFlight } = useChatStore();

  const showConfirm = state.context.state === "confirming";
  const lastError = useMemo(() => state.errors[state.errors.length - 1], [state.errors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top','left','right','bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>#support-bot</Text>
          <View style={styles.headerActions}>
            <Text style={styles.latency}>{state.lastLatencyMs ? `Last: ${state.lastLatencyMs} ms` : ""}</Text>
            {state.pending ? (
              <TouchableOpacity onPress={cancelInFlight} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {state.context.state === 'complete' && state.context.ticketId ? (
        <View style={styles.completeWrap}>
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>Completed • {state.context.ticketId}</Text>
          </View>
        </View>
      ) : null}

      <MessageList messages={state.messages} />

      {showConfirm ? (
        <ConfirmBar onYes={() => sendUserMessage("Yes")} onNo={() => sendUserMessage("No")} />
      ) : null}

      {lastError && !state.pending ? (
        <View style={styles.errorWrap}>
          <View style={styles.errorBar}>
            <Text style={styles.errorText} numberOfLines={1}>Error: {lastError}</Text>
            <TouchableOpacity style={styles.errorRetry} onPress={retryLast}>
              <Text style={styles.errorRetryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Composer disabled={state.pending} onSend={(t) => sendUserMessage(t)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#0f172a', fontSize: 18, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  latency: { color: '#64748b', fontSize: 12, marginRight: 8 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#ef4444' },
  cancelText: { color: '#ffffff', fontSize: 12 },
  completeWrap: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  completeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5' },
  completeText: { color: '#065f46', fontSize: 13 },
  errorWrap: { paddingHorizontal: 12, paddingBottom: 8 },
  errorBar: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { color: '#b91c1c', fontSize: 13 },
  errorRetry: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#ef4444' },
  errorRetryText: { color: '#ffffff', fontSize: 12 },
});


