import React, {useState} from 'react';
import {
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useChatStore} from '../store/chatStore';

const HomeScreen = () => {
  const [input, setInput] = useState('');
  const {setMessages, setIsChatActive} = useChatStore();
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(1);

  const handleSubmit = () => {
    console.log('headlfjal;jdfa');
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages([newMessage]);
    setIsChatActive(true);
    navigation.navigate('Chat');

    // Animated.timing(fadeAnim, {
    //   toValue: 0,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start(() => {
    //   navigation.navigate('Chat');
    //   fadeAnim.setValue(1);
    // });
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <Text style={styles.title}>Sarvam Assignment</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Ask me anything..."
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Ask</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#CB5434',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
