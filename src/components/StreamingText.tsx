// src/components/StreamingText.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import MarkdownRenderer from './MarkdownRenderer';

interface StreamingTextProps {
  text: string;
  speed?: number;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ opacity: opacityAnim }}>
      <MarkdownRenderer text={displayedText} />
    </Animated.View>
  );
};

export default StreamingText;
