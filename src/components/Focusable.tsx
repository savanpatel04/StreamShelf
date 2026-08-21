import { useEffect, useId, useRef, useState } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { colors, radii } from '../theme';
import { useFocusRegistry } from '../focus/DirectionalNav';

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  hoveredStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
};

export function Focusable({
  onPress,
  children,
  style,
  focusedStyle,
  hoveredStyle,
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
}: Props) {
  const generatedId = useId();
  const { focusedId, register, unregister, setFocused } = useFocusRegistry();
  const nodeId = `${generatedId}:${testID ?? 'focusable'}`;
  const isFocused = focusedId === nodeId;
  const [isHovered, setIsHovered] = useState(false);
  const onPressRef = useRef(onPress);
  const pressableRef = useRef<React.ElementRef<typeof Pressable>>(null);
  onPressRef.current = onPress;

  useEffect(() => {
    return () => unregister(nodeId);
  }, [nodeId, unregister]);

  const publishLayout = () => {
    pressableRef.current?.measureInWindow?.((x, y, width, height) => {
      register({
        id: nodeId,
        x,
        y,
        width,
        height,
        onSelect: () => onPressRef.current(),
      });
    });
  };

  return (
    <Pressable
      ref={pressableRef}
      testID={testID}
      focusable
      hasTVPreferredFocus={isFocused}
      onPress={() => {
        setFocused(nodeId);
        onPress();
      }}
      onFocus={() => setFocused(nodeId)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
      onLayout={publishLayout}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.base,
        style,
        isFocused && styles.focused,
        isFocused && focusedStyle,
        isHovered && hoveredStyle,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.focus,
  },
});
