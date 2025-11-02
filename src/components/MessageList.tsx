import React, { useEffect, useRef } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ChatMessage } from "../types/chat";
import { ChatBubble } from "./ChatBubble";

interface Props {
  messages: ChatMessage[];
}

export const MessageList: React.FC<Props> = ({ messages }) => {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  return (
    <FlatList
      ref={listRef}
      style={styles.list}
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: 10,
  },
  separator: {
    height: 2,
  },
});


