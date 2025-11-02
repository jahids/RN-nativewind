import React from "react";
import { Text, View } from "react-native";
import { ChatMessage } from "@/types/chat";

interface Props {
  message: ChatMessage;
}

export const ChatBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";
  const bubbleBase = isUser
    ? "bg-primary/90"
    : message.error
    ? "bg-danger/20 border border-danger/50"
    : "bg-surface";

  return (
    <View className={`w-full px-3 my-1 ${isUser ? "items-end" : "items-start"}`}>
      <View className={`max-w-[86%] rounded-2xl px-4 py-2 ${bubbleBase}`}>
        <Text className={`text-[15px] leading-5 ${isUser ? "text-white" : "text-textPrimary"}`}>
          {message.text}
        </Text>
        {message.pending ? (
          <Text className="text-[11px] text-textSecondary mt-1">Thinking…</Text>
        ) : message.error ? (
          <Text className="text-[11px] text-danger mt-1">{message.error}</Text>
        ) : null}
      </View>
    </View>
  );
};



