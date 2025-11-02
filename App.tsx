import React from 'react';
import './global.css';
import { ChatProvider } from './src/store/chatStore';
import { ChatScreen } from './src/screens/ChatScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatProvider>
        <StatusBar style="dark" />
        <ChatScreen />
      </ChatProvider>
    </SafeAreaProvider>
  );
}


