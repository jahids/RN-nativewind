import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface Props {
  onYes: () => void;
  onNo: () => void;
}

export const ConfirmBar: React.FC<Props> = ({ onYes, onNo }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.label}>Submit the ticket now?</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.noBtn} onPress={onNo}>
            <Text style={styles.noText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesBtn} onPress={onYes}>
            <Text style={styles.yesText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 12, paddingBottom: 8 },
  container: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: '#475569', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8 },
  noBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  noText: { color: '#374151' },
  yesBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#10b981',
  },
  yesText: { color: '#ffffff', fontWeight: '600' },
});


