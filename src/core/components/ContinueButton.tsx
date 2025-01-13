import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from "react-native";

type ContinueButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function ContinueButton({
  onPress,
  disabled = false,
  children,
  style,
}: ContinueButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const containerStyle = [
    styles.container,
    disabled ? styles.disabledBackground : styles.enabledBackground,
  ];

  const textStyle = [
    styles.text,
    disabled ? styles.disabledText : styles.enabledText,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.button, style]}
    >
      <View style={containerStyle}>
        {children ? children : <Text style={textStyle}>Continue</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
  },
  container: {
    width: "100%",
    borderRadius: 9999,
    paddingVertical: 20,
  },
  disabledBackground: {
    backgroundColor: "#f5f5f4",
  },
  enabledBackground: {
    backgroundColor: "#44403c",
  },
  text: {
    textAlign: "center",
    fontSize: 18,
  },
  disabledText: {
    color: "#d6d3d1",
  },
  enabledText: {
    color: "#e7e5e4",
  },
});
