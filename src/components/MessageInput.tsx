// src/components/MessageInput.tsx
import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import {useChatStore} from '../store/chatStore';

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({onSend}) => {
  const [text, setText] = useState('');
  const messages = useChatStore(state => state.messages);
  const addMessage = useChatStore(state => state.addMessage);
  const buttonScale = new Animated.Value(1);

  const handleSend = () => {
    if (!text.trim()) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
    };

    addMessage(userMessage);
    setText('');

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: simulateAIResponse(text),
        isUser: false,
        isStreaming: true,
      };
      addMessage(aiMessage);
    }, 500);
  };

  const simulateAIResponse = (query: string): string => {
    const responses = [
      `I'm an AI assistant. You asked: "${query}". Here's some information about that topic...`,
      `Based on your question "${query}", I can tell you that...`,
      `$$\\int_{a}^{b} x^2 dx$$ is the integral of x squared from a to b. You asked about "${query}".`,
      `Your question "${query}" is interesting. Let me explain with some **markdown**:\n\n- First point\n- Second point\n\nAnd some math: $E = mc^2$`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#999"
        onSubmitEditing={handleSend}
      />
      <Animated.View style={{transform: [{scale: buttonScale}]}}>
        <TouchableOpacity style={styles.button} onPress={handleSend}>
          {/* You can use an icon here instead */}
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  button: {
    width: 80,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CB5434',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MessageInput;
