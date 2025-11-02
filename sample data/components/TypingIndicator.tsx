import React from "react";
import { Text, View } from "react-native";

export const TypingIndicator: React.FC = () => {
  return (
    <View className="w-full items-start px-3 my-1">
      <View className="bg-surface rounded-2xl px-4 py-2">
        <Text className="text-[13px] text-textSecondary">Assistant is thinking…</Text>
      </View>
    </View>
  );
};



