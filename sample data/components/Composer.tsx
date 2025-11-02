import React, { useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native";

interface Props {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export const Composer: React.FC<Props> = ({ disabled, onSend }) => {
  const [text, setText] = useState("");
  const canSend = !disabled && text.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    const t = text;
    setText("");
    onSend(t);
  };

  return (
    <View className="flex-row items-center p-3 gap-2 bg-surface border-t border-white/5">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message support assistant"
        placeholderTextColor="#6B7280"
        className="flex-1 text-[16px] text-textPrimary bg-[#0b1226] rounded-2xl px-4 py-3"
        editable={!disabled}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        accessibilityLabel="Send"
        className={`px-4 py-3 rounded-2xl ${canSend ? "bg-primary" : "bg-white/10"}`}
        onPress={submit}
        disabled={!canSend}
      >
        <Text className={`font-semibold ${canSend ? "text-white" : "text-textSecondary"}`}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};



