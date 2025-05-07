import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, SafeAreaView, Dimensions } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { useChatStore } from '../store/chatStore';

const { height } = Dimensions.get('window');

const ChatScreen = () => {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showSpacer, setShowSpacer] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // useEffect(() => {
  //   if (messages.length > 0 && scrollViewRef.current) {
  //     setTimeout(() => {
  //       scrollViewRef.current?.scrollToEnd({ animated: true });
  //     }, 100);
  //   }
  // }, [messages]);
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.isUser) {
          // scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          setShowSpacer(true);
        } else {
          // setShowSpacer(false);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [messages]);

  console.log(JSON.stringify(messages, null, 2));

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
    };
    addMessage(userMessage);

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(text),
        isUser: false,
        isStreaming: true,
      };
      addMessage(aiMessage);
    }, 800);
  };

  // useEffect(() => {
  //   handleSendMessage(messages[0]?.text);
  // }, []);
  useEffect(() => {
    if (messages.length === 1 && messages[0].isUser) {
      const userMessage = messages[0];
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(userMessage.text),
          isUser: false,
          isStreaming: true,
        };
        addMessage(aiMessage);
      }, 800);
    }
  }, [messages]);

  const getAIResponse = (query: string): string => {
    const responses = [
      `I received your message: "${query}". This is a simulated response from the AI assistant.`,
      `Regarding "${query}", here's what I can tell you... This is a demo response.`,
      `Thanks for asking about "${query}". In a real app, this would connect to an AI API.`,
      `I'm an AI assistant. You asked: "${query}". Here's a sample response with **markdown** support:\n\n- First point\n- Second point\n\nAnd some math: $E = mc^2$`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              isStreaming={message.isStreaming}
            />
          ))}
          {showSpacer &&
           <View style={styles.spacer} />
          }
        </ScrollView>
        <MessageInput onSend={handleSendMessage} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    // backgroundColor: 'red',
    // paddingBottom: height * 0.5,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  spacer: {
    height: height * 0.53,
    // backgroundColor: 'red',
  },
});

export default ChatScreen;
