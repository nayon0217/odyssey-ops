import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';

type SpacingToken = keyof typeof tokens.spacing;
type SurfaceToken = keyof typeof tokens.colors.surface;
type RadiusToken = keyof typeof tokens.radius;
type ShadowToken = keyof typeof tokens.shadow;

export type BoxProps = ViewProps & {
  direction?: ViewStyle['flexDirection'];
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: ViewStyle['flexWrap'];
  flex?: number;
  gap?: SpacingToken;
  padding?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  bg?: SurfaceToken;
  radius?: RadiusToken;
  border?: boolean;
  shadow?: ShadowToken;
  style?: StyleProp<ViewStyle>;
};

/** Token-aware layout primitive. Keeps pages free of inline spacing/color literals. */
export function Box({
  direction,
  align,
  justify,
  wrap,
  flex,
  gap,
  padding,
  px,
  py,
  bg,
  radius,
  border,
  shadow,
  style,
  ...rest
}: BoxProps) {
  const computed: ViewStyle = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    flex,
    gap: gap != null ? tokens.spacing[gap] : undefined,
    padding: padding != null ? tokens.spacing[padding] : undefined,
    paddingHorizontal: px != null ? tokens.spacing[px] : undefined,
    paddingVertical: py != null ? tokens.spacing[py] : undefined,
    backgroundColor: bg ? tokens.colors.surface[bg] : undefined,
    borderRadius: radius != null ? tokens.radius[radius] : undefined,
    borderWidth: border ? tokens.border.hairline : undefined,
    borderColor: border ? tokens.colors.border.subtle : undefined,
  };
  return <View {...rest} style={[computed, shadow ? tokens.shadow[shadow] : null, style]} />;
}

export function Stack(props: BoxProps) {
  return <Box direction="column" {...props} />;
}

export function Row(props: BoxProps) {
  return <Box direction="row" align="center" {...props} />;
}

export function Spacer({ size = 'md' }: { size?: SpacingToken }) {
  return <View style={{ height: tokens.spacing[size], width: tokens.spacing[size] }} />;
}

export function Divider({ vertical = false }: { vertical?: boolean }) {
  return (
    <View
      style={
        vertical
          ? { width: tokens.border.hairline, alignSelf: 'stretch', backgroundColor: tokens.colors.border.subtle }
          : { height: tokens.border.hairline, alignSelf: 'stretch', backgroundColor: tokens.colors.border.subtle }
      }
    />
  );
}
