import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

/**
 * Props for the ProgressBar component
 * @typedef {Object} ProgressBarProps
 * @property {number} current - The current progress value
 * @property {number} total - The total value representing 100% progress
 */
type ProgressBarProps = {
  current: number;
  total: number;
};

/**
 * A animated progress bar component that shows completion progress
 * @component
 * @param {ProgressBarProps} props - The component props
 * @param {number} props.current - Current progress value between 0 and total
 * @param {number} props.total - Maximum value representing 100% progress
 *
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Calculate target progress percentage
    const targetProgress = (current / total) * 100;

    // Animate to new progress value
    progress.value = withTiming(targetProgress, {
      duration: 150, // Animation duration in ms
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [current, total]);

  // Animated style for progress bar width
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={[styles.container]}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: "92%",
    overflow: "hidden",
    borderRadius: 9999,
    backgroundColor: "#f5f5f4",
  },
  progressBar: {
    height: "100%",
    borderRadius: 9999,
    backgroundColor: "#44403c",
  },
});
