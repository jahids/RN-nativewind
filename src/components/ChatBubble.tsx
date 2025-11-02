import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { ChatMessage } from "../types/chat";

interface Props {
  message: ChatMessage;
}

export const ChatBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";
  const containerStyle = [styles.row, isUser ? styles.alignEnd : styles.alignStart];
  const bubbleStyle = [
    styles.bubble,
    isUser ? styles.userBubble : styles.assistantBubble,
    message.error ? styles.errorBubble : undefined,
  ];
  const textStyle = [styles.text, isUser ? styles.userText : styles.assistantText];
  return (
    <View style={containerStyle}>
      <View style={bubbleStyle}>
        <Text style={textStyle}>{message.text}</Text>
        {message.pending ? (
          <Text style={styles.pending}>Thinking…</Text>
        ) : message.error ? (
          <Text style={styles.errorText}>{message.error}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '86%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#2563eb',
  },
  assistantBubble: {
    backgroundColor: '#f1f5f9',
  },
  errorBubble: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: { color: '#ffffff' },
  assistantText: { color: '#0f172a' },
  pending: { marginTop: 4, fontSize: 11, color: '#64748b' },
  errorText: { marginTop: 4, fontSize: 11, color: '#b91c1c' },
});


