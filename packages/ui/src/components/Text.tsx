import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { tokens, type TextVariant } from '../tokens';

type TextColorToken = keyof typeof tokens.colors.text;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** A text color token (primary/secondary/muted/inverse/link) or a raw color string. */
  color?: TextColorToken | string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
};

export function Text({ variant = 'body', color = 'primary', align, style, ...rest }: TextProps) {
  const palette = tokens.colors.text as Record<string, string>;
  const resolvedColor = palette[color] ?? color;
  return (
    <RNText
      {...rest}
      style={[tokens.textVariants[variant], { color: resolvedColor }, align ? { textAlign: align } : null, style]}
    />
  );
}
