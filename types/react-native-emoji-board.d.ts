declare module 'react-native-emoji-board' {
  import * as React from 'react';
    import { ViewStyle } from 'react-native';

  export interface EmojiBoardProps {
    showBoard: boolean;
    onClick: (emoji: { code: string }) => void;
    containerStyle?: ViewStyle;
  }

  const EmojiBoard: React.FC<EmojiBoardProps>;
  export default EmojiBoard;
}
