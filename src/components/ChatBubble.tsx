import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StreamingText from './StreamingText';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  isStreaming?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, isStreaming }) => {
  return (
    <View style={[styles.container, isUser ? styles.userBubble : styles.assistantBubble]}>
      {isStreaming ? (
        <StreamingText text={message} />
      ) : (
        // <MarkdownRenderer text={message} />
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: 'white',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#CB5434',
    borderBottomRightRadius: 0,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
  },
});

export default ChatBubble;
