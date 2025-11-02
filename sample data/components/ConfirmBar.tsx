import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onYes: () => void;
  onNo: () => void;
}

export const ConfirmBar: React.FC<Props> = ({ onYes, onNo }) => {
  return (
    <View className="px-3 pb-2">
      <View className="bg-[#0b1226] border border-white/5 rounded-2xl p-3 flex-row items-center justify-between">
        <Text className="text-textSecondary text-[13px]">Submit the ticket now?</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="px-3 py-2 rounded-xl bg-white/10" onPress={onNo}>
            <Text className="text-textSecondary">No</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-3 py-2 rounded-xl bg-success" onPress={onYes}>
            <Text className="text-white font-semibold">Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};



