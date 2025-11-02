import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import { useChatStore } from "@/store/chatStore";
import { MessageList } from "@/components/MessageList";
import { Composer } from "@/components/Composer";
import { ConfirmBar } from "@/components/ConfirmBar";

export const ChatScreen: React.FC = () => {
  const { state, sendUserMessage, retryLast, cancelInFlight } = useChatStore();

  const showConfirm = state.context.state === "confirming";
  const lastError = useMemo(() => state.errors[state.errors.length - 1], [state.errors]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-white/5 bg-background/80">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-[18px] font-semibold">#support-bot</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-textSecondary text-[12px]">{state.lastLatencyMs ? `Last: ${state.lastLatencyMs} ms` : ""}</Text>
            {state.pending ? (
              <TouchableOpacity onPress={cancelInFlight} className="px-3 py-1 rounded-xl bg-danger/80">
                <Text className="text-white text-[12px]">Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <MessageList messages={state.messages} />

      {showConfirm ? (
        <ConfirmBar onYes={() => sendUserMessage("Yes")} onNo={() => sendUserMessage("No")} />
      ) : null}

      {lastError && !state.pending ? (
        <View className="px-3 pb-2">
          <View className="bg-danger/10 border border-danger/40 rounded-2xl p-3 flex-row items-center justify-between">
            <Text className="text-danger text-[13px]" numberOfLines={1}>Error: {lastError}</Text>
            <TouchableOpacity className="px-3 py-1 rounded-xl bg-danger/80" onPress={retryLast}>
              <Text className="text-white text-[12px]">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Composer disabled={state.pending} onSend={(t) => sendUserMessage(t)} />
    </SafeAreaView>
  );
};



