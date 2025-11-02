import React, { useEffect, useRef } from "react";
import { FlatList, View } from "react-native";
import { ChatMessage } from "@/types/chat";
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
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 10 }}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
    />
  );
};



