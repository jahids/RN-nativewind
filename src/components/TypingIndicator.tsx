import React from "react";
import { Text, View, StyleSheet } from "react-native";

export const TypingIndicator: React.FC = () => {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.text}>Assistant is thinking…</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { width: '100%', alignItems: 'flex-start', paddingHorizontal: 12, marginVertical: 4 },
  bubble: { backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  text: { fontSize: 13, color: '#64748b' },
});


