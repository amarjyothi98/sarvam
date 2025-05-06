import React from 'react';
import Markdown from 'react-native-markdown-display';
import { View } from 'react-native';
import MathJax from 'react-native-mathjax-svg';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const renderMath = (match: string) => (
    <MathJax
      math={match}
      color="#000"
      fontSize={16}
      style={{ backgroundColor: 'transparent' }}
    />
  );

  const rules = {
    math_inline: (node: any, children: any, parent: any, styles: any) => {
      return renderMath(node.content);
    },
    math_block: (node: any, children: any, parent: any, styles: any) => {
      return renderMath(node.content);
    },
  };

  return (
    <View>
      <Markdown rules={rules}>
        {text.replace(/\$\$(.*?)\$\$/g, '\\[$1\\]').replace(/\$(.*?)\$/g, '\\($1\\)')}
      </Markdown>
    </View>
  );
};

export default MarkdownRenderer;