import React, { useState } from "react";
import { TextInput, TouchableOpacity, View, Text, StyleSheet } from "react-native";

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
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message #support-bot"
        placeholderTextColor="#6B7280"
        style={styles.input}
        editable={!disabled}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        accessibilityLabel="Send"
        style={[styles.sendBtn, { backgroundColor: canSend ? '#2563eb' : '#e5e7eb' }]}
        onPress={submit}
        disabled={!canSend}
      >
        <Text style={[styles.sendText, { color: canSend ? '#ffffff' : '#6b7280' }]}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  sendText: {
    fontWeight: '600',
  },
});


